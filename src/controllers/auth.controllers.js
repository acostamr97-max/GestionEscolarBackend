import { ENVIRONMENT } from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import { USER_ROLES_LIST } from "../const/roles.const.js";
import userService from "../services/user.service.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/* ----------------------------------------------------------------------------
   Helper de modulo: arma el token de sesion + los datos publicos del usuario.
   Lo usan tanto el login normal como el "entrar directo" de la recuperacion,
   asi no repetimos el codigo en dos lados.

   Va FUERA de la clase a proposito: como Express llama a los metodos del
   controller como callbacks sueltos, el `this` dentro de ellos queda undefined.
   Por eso no usamos `this.algo()`: una funcion de modulo no depende de `this`.
   ---------------------------------------------------------------------------- */
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

/* ============================================================================
   AuthController: maneja todo lo relacionado con la autenticacion de usuarios.
   - register:    crear cuenta + enviar mail de verificacion.
   - verifyEmail: validar el token que llega por mail y activar la cuenta.
   - login:       validar credenciales y devolver un JWT de sesion.

   Es la capa "controller": se ocupa de leer el request, validar datos basicos,
   coordinar el repositorio/mailer y armar la response. La idea es que NO tenga
   queries directas a la base (eso vive en el repository).
   ============================================================================ */
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

            /* No permitimos dos cuentas con el mismo email */

            const existingUser = await userService.getByEmail(email);
            if (existingUser) {
                throw new ServerError("El email ya está registrado", 400);
            }

            /* Hasheo de la contrasena con bcrypt. El "12" son las salt rounds:
               cuanto mas alto, mas seguro pero mas lento. 12 es un valor estandar.
               Guardar el hash (no la pass real) es un requisito de seguridad. */
            const hashed_password = await bcrypt.hash(password, 12);

            /* Genero el token de verificacion ANTES de crear el usuario,
               asi lo puedo guardar en el documento y despues encontrarlo al verificar.
               El token es un JWT que lleva el email adentro y vence en 1 dia (1d):
               si el usuario no verifica en ese plazo, el link deja de servir. */
            const verification_token = jwt.sign(
                { email: email },
                ENVIRONMENT.JWT_SECRET,
                { expiresIn: '1d' }
            );

            /* Creo el usuario en la base. Queda con email_verificado=false (default). */
            const newUser = await userService.create(nombre, email, hashed_password, role, verification_token);

            /* Envio el mail de verificacion. El link apunta a la API (que es quien
               valida el token); la API despues redirige al frontend. */
            /* Nota: no pasamos 'from'; el mailer usa el remitente por defecto de Resend. */
            await mailer_transport.sendMail({
                to: email,
                subject: "Verificá tu cuenta",
                html: `
                    <h1>Bienvenido/a a la Plataforma</h1>
                    <p><a href='${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}'>Click aquí</a> para verificar tu cuenta.</p>
                `
            });

            /* Respondo 201 (creado). NO devuelvo la contrasena ni el token,
               solo datos publicos del usuario. */
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

            /* Si el error es uno que nosotros lanzamos (ServerError), usamos su
               status y mensaje. Si es un error inesperado, devolvemos 500 generico
               y lo logueamos en consola para poder debuggear. */
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

    /* ------------------------------------------------------------------------
       VERIFICACION DE EMAIL
       Se llega aca cuando el usuario hace click en el link del mail.
       En vez de responder JSON, REDIRIGE al frontend a la pantalla
       /verificar-cuenta con un parametro ?estado=... para que el front muestre
       el cartel adecuado al usuario (una pantalla linda, no un JSON crudo).
       Estados posibles: ok | ya-verificado | expirado | error
       ------------------------------------------------------------------------ */
    async verifyEmail(request, response) {
        /* Base de la pantalla del front que muestra el resultado */
        const front = `${ENVIRONMENT.URL_FRONTEND}/verificar-cuenta`;

        try {

            /* El token viaja como query param en la URL del link */
            const { verification_token } = request.query;

            if (!verification_token) {
                throw new ServerError("Falta token de verificación", 400);
            }

            /* jwt.verify valida la firma y la expiracion. Si el token esta vencido
               o fue adulterado, lanza una excepcion que capturamos abajo. */
            const payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET);
            const { email } = payload;
            const user = await userService.getByEmail(email);

            /* Si no existe un usuario con ese email, algo anda mal -> error */
            if (!user) {
                return response.redirect(`${front}?estado=error`);
            }

            /* Si ya estaba verificado, avisamos sin volver a procesar */
            if (user.email_verificado) {
                return response.redirect(`${front}?estado=ya-verificado`);
            }

            /* Marco la cuenta como verificada: recien ahora va a poder loguearse */
            await userService.updateById(user._id, { email_verificado: true });

            /* Verificacion exitosa: el front mostrara el cartel de bienvenida */
            return response.redirect(`${front}?estado=ok`);

        } catch (error) {
            console.error('Error en verificación:', error);

            /* Errores tipicos de JWT (vencido / firma invalida) -> "expirado".
               Cualquier otra cosa -> "error" generico. */
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

    /* ------------------------------------------------------------------------
       LOGIN
       Flujo:
         1. Validar email y password.
         2. Buscar el usuario por email.
         3. Bloquear si el email no fue verificado todavia.
         4. Comparar la contrasena enviada contra el hash guardado.
         5. Si todo ok, firmar un JWT con los datos del usuario (incluido el rol)
            y devolverlo. Ese token es el que el front guarda y manda en cada
            request protegido (header Authorization: Bearer <token>).
       ------------------------------------------------------------------------ */
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

            /* Regla de negocio: no se puede loguear sin haber verificado el email.
               Esto obliga a completar el circuito de verificacion. */
            if (!user_found.email_verificado) {
                throw new ServerError("Usuario con verificación de gmail pendiente", 401);
            }

            /* bcrypt.compare vuelve a hashear la pass enviada y la compara con el
               hash guardado. Nunca se "desencripta" la contrasena. */
            const is_same_password = await bcrypt.compare(password, user_found.password);

            if (!is_same_password) {
                throw new ServerError("Credenciales inválidas", 401);
            }

            /* Estos son los datos que van DENTRO del token. Incluimos el rol
               porque el roleMiddleware lo necesita para autorizar acciones
               (ej: solo 'director' puede crear aulas). NO incluimos la pass. */
            const profile_info = {
                nombre: user_found.nombre || user_found.name,
                email: user_found.email,
                id: user_found._id,
                role: user_found.role,
                fecha_creacion: user_found.fecha_creacion
            };

            /* Firmo el token de sesion. Vence en 3 horas: pasado ese tiempo el
               usuario tiene que volver a loguearse (medida de seguridad). */
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
                    /* Devolvemos tambien los datos publicos del usuario, asi el
                       frontend los usa directamente (mostrar nombre, decidir que
                       ve cada rol) sin tener que leerlos desde el token. */
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

    /* ------------------------------------------------------------------------
       OLVIDE MI CONTRASENA (paso 1: pedir recuperacion)
       Recibe un email. Si existe una cuenta con ese email, le manda un mail con
       un link al FRONTEND que incluye un token de recuperacion (vence en 1 hora).

       Nota de seguridad: respondemos SIEMPRE el mismo mensaje de exito, exista o
       no el email. Asi no le revelamos a un atacante que emails estan registrados
       (esto se llama no hacer "enumeracion de usuarios").
       ------------------------------------------------------------------------ */
    async forgotPassword(request, response) {
        try {
            const { email } = request.body;

            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new ServerError("Email inválido", 400);
            }

            const user = await userService.getByEmail(email);

            /* Solo mandamos el mail si el usuario existe, pero la respuesta es la
               misma en ambos casos (ver nota de seguridad arriba). */
            if (user) {
                /* Token con proposito 'recuperacion' para no confundirlo con otros.
                   Vence en 1 hora: un link de reset no deberia durar mucho. */
                const recovery_token = jwt.sign(
                    { id: user._id, tipo: 'recuperacion' },
                    ENVIRONMENT.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                /* El link apunta al FRONTEND (a diferencia de la verificacion de
                   email): el front muestra una pantalla con las dos opciones. */
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

    /* ------------------------------------------------------------------------
       RESETEAR CONTRASENA (opcion A del link: cambiar la contrasena)
       Recibe el token de recuperacion + la contrasena nueva. Valida el token,
       hashea la nueva contrasena y la guarda.
       ------------------------------------------------------------------------ */
    async resetPassword(request, response) {
        try {
            const { token, password } = request.body;

            if (!token) {
                throw new ServerError("Falta el token de recuperación", 400);
            }
            if (!password || password.length < 6) {
                throw new ServerError("La contraseña debe tener al menos 6 caracteres", 400);
            }

            /* Validamos el token y, ademas, que sea del tipo correcto. Si alguien
               intenta usar un token de login aca, lo rechazamos. */
            const payload = jwt.verify(token, ENVIRONMENT.JWT_SECRET);
            if (payload.tipo !== 'recuperacion') {
                throw new ServerError("Token inválido para esta acción", 400);
            }

            const user = await userService.getById(payload.id);
            if (!user) {
                throw new ServerError("Usuario no encontrado", 404);
            }

            /* Hasheamos la nueva contrasena y la guardamos */
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

    /* ------------------------------------------------------------------------
       ENTRAR DIRECTO (opcion B del link: iniciar sesion sin cambiar nada)
       Recibe el token de recuperacion y, si es valido, devuelve un token de
       sesion normal (como el del login). Asi la persona entra sin tocar la
       contrasena.

       Nota: por seguridad, lo ideal seria obligar a cambiarla. Esta opcion existe
       porque se pidio expresamente. El token de recuperacion es de un solo uso
       practico (vida corta) para acotar el riesgo.
       ------------------------------------------------------------------------ */
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

            /* Generamos una sesion normal (mismo formato que el login) */
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
