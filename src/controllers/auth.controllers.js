import { ENVIRONMENT } from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import { USER_ROLES_LIST } from "../const/roles.const.js";
import userService from "../services/user.service.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


function generarSesion(user) {
    const profile_info = {
        nombre: user.nombre,
        email: user.email,
        id: user._id,
        role: user.role
    };
    const access_token = jwt.sign(profile_info, ENVIRONMENT.JWT_SECRET, { expiresIn: '3h' });
    return {
        access_token,
        user: {
            id: user._id,
            nombre: user.nombre,
            email: user.email,
            role: user.role
        }
    };
}

class AuthController {


    async register(request, response) {
        try {

            const { nombre, email, password, role } = request.body;


            if (!nombre || nombre.length <= 2) {
                throw new ServerError("Nombre debe ser mayor a 2 caracteres", 400);
            }
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400);
            }

            if (!password || password.length < 6) {
                throw new ServerError("Password debe tener al menos 6 caracteres", 400);
            }

            if (!role || !USER_ROLES_LIST.includes(role)) {
                throw new ServerError("Rol inválido. Debe ser: " + USER_ROLES_LIST.join(', '), 400);
            }


            const existingUser = await userService.getByEmail(email);
            if (existingUser) {
                throw new ServerError("El email ya está registrado", 400);
            }

            const hashed_password = await bcrypt.hash(password, 12);

            const verification_token = jwt.sign(
                { email: email },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: '1d' }
            );

            const newUser = await userService.create(nombre, email, hashed_password, role, verification_token);

            await mailer_transport.sendMail({
                to: email,
                subject: "Verificá tu cuenta",
                html: `
                    <h1>Bienvenido/a a la Plataforma</h1>
                    <p><a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>Click aquí</a> para verificar tu cuenta.</p>
                `
            });

            return response.status(201).json({
                message: "Usuario registrado con éxito. Por favor verifique su correo.",
                ok: true,
                status: 201,
                data: {
                    user: {
                        id: newUser._id,
                        nombre: newUser.nombre,
                        email: newUser.email,
                        role: newUser.role
                    }
                }
            });
        } catch (error) {

            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            } else {
                console.error('Error crítico en registro:', error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }

    async verifyEmail(request, response) {
        const front = `${ENVIRONMENT.URL_FRONTEND}/verificar-cuenta`;

        try {
            const { verification_token } = request.query;

            if (!verification_token) {
                throw new ServerError("Falta token de verificación", 400);
            }

            const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET);
            const { email } = payload;
            const user = await userService.getByEmail(email);
            if (!user) {
                return response.redirect(`${front}?estado=error`);
            }

            if (user.email_verificado) {
                return response.redirect(`${front}?estado=ya-verificado`);
            }

            await userService.updateById(user._id, { email_verificado: true });

            return response.redirect(`${front}?estado=ok`);

        } catch (error) {
            console.error('Error en verificación:', error);

            if (
                error instanceof jwt.JsonWebTokenError ||
                error instanceof jwt.NotBeforeError ||
                error instanceof jwt.TokenExpiredError
            ) {
                return response.redirect(`${front}?estado=expirado`);
            } else {
                return response.redirect(`${front}?estado=error`);
            }
        }
    }

    async login(request, response) {
        try {
            const { email, password } = request.body;

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400);
            }

            if (!password || password.length < 6) {
                throw new ServerError("Contraseña inválida", 400);
            }

            const user_found = await userService.getByEmail(email);

            if (!user_found) {
                throw new ServerError("Usuario no registrado", 404);
            }

            if (!user_found.email_verificado) {
                throw new ServerError("Usuario con verificación de gmail pendiente", 401);
            }

            const is_same_password = await bcrypt.compare(password, user_found.password);

            if (!is_same_password) {
                throw new ServerError("Credenciales inválidas", 401);
            }

            const profile_info = {
                nombre: user_found.nombre || user_found.name,
                email: user_found.email,
                id: user_found._id,
                role: user_found.role,
                fecha_creacion: user_found.fecha_creacion
            };

            const access_token = jwt.sign(
                profile_info,
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: '3h' }
            );

            return response.status(200).json({
                ok: true,
                status: 200,
                message: 'Usuario autenticado exitosamente',
                data: {
                    access_token,
                    user: {
                        id: user_found._id,
                        nombre: user_found.nombre,
                        email: user_found.email,
                        role: user_found.role
                    }
                }
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            } else {
                console.error('Error crítico en login:', error);
                return response.status(500).json({
                    message: "Error interno del servidor",
                    ok: false,
                    status: 500
                });
            }
        }
    }
    async forgotPassword(request, response) {
        try {
            const { email } = request.body;

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400);
            }

            const user = await userService.getByEmail(email);

            if (user) {
                const recovery_token = jwt.sign(
                    { id: user._id, tipo: 'recuperacion' },
                    ENVIRONMENT.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                const link = `${ENVIRONMENT.URL_FRONTEND}/recuperar-cuenta?token=${recovery_token}`;

                await mailer_transport.sendMail({
                    to: email,
                    subject: "Recuperá tu contraseña",
                    html: `
                        <h1>Recuperación de cuenta</h1>
                        <p>Pediste recuperar el acceso a tu cuenta.</p>
                        <p><a href='${link}'>Hacé click aquí</a> para continuar. El enlace vence en 1 hora.</p>
                        <p>Si no fuiste vos, ignorá este mensaje.</p>
                    `
                });
            }

            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Si el email está registrado, te enviamos un enlace para recuperar tu cuenta."
            });
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({ message: error.message, ok: false, status: error.status });
            }
            console.error('Error en forgotPassword:', error);
            return response.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
        }
    }

    async resetPassword(request, response) {
        try {
            const { token, password } = request.body;

            if (!token) {
                throw new ServerError("Falta el token de recuperación", 400);
            }
            if (!password || password.length < 6) {
                throw new ServerError("La contraseña debe tener al menos 6 caracteres", 400);
            }

            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            if (payload.tipo !== 'recuperacion') {
                throw new ServerError("Token inválido para esta acción", 400);
            }

            const user = await userService.getById(payload.id);
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            const hashed_password = await bcrypt.hash(password, 12);
            await userService.updateById(user._id, { password: hashed_password });

            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Contraseña actualizada. Ya podés iniciar sesión."
            });
        } catch (error) {
            if (
                error instanceof jwt.JsonWebTokenError ||
                error instanceof jwt.TokenExpiredError ||
                error instanceof jwt.NotBeforeError
            ) {
                return response.status(401).json({ message: "El enlace venció o no es válido", ok: false, status: 401 });
            }
            if (error instanceof ServerError) {
                return response.status(error.status).json({ message: error.message, ok: false, status: error.status });
            }
            console.error('Error en resetPassword:', error);
            return response.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
        }
    }

    async loginWithRecoveryToken(request, response) {
        try {
            const { token } = request.body;

            if (!token) {
                throw new ServerError("Falta el token de recuperación", 400);
            }

            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            if (payload.tipo !== 'recuperacion') {
                throw new ServerError("Token inválido para esta acción", 400);
            }

            const user = await userService.getById(payload.id);
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            const sesion = generarSesion(user);

            return response.status(200).json({
                ok: true,
                status: 200,
                message: 'Ingresaste correctamente',
                data: sesion
            });
        } catch (error) {
            if (
                error instanceof jwt.JsonWebTokenError ||
                error instanceof jwt.TokenExpiredError ||
                error instanceof jwt.NotBeforeError
            ) {
                return response.status(401).json({ message: "El enlace venció o no es válido", ok: false, status: 401 });
            }
            if (error instanceof ServerError) {
                return response.status(error.status).json({ message: error.message, ok: false, status: error.status });
            }
            console.error('Error en loginWithRecoveryToken:', error);
            return response.status(500).json({ message: "Error interno del servidor", ok: false, status: 500 });
        }
    }
}

const authController = new AuthController();
export default authController;
