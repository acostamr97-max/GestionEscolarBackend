import express from 'express'
import authController from '../controllers/auth.controllers.js'

/* ============================================================================
   Rutas de autenticacion. Se montan en main.js bajo el prefijo /api/auth,
   asi que las rutas finales quedan:
     POST /api/auth/register             -> crear cuenta
     GET  /api/auth/verify-email         -> verificar email (link del mail)
     POST /api/auth/login                -> iniciar sesion
     POST /api/auth/forgot-password      -> pedir recuperacion (manda mail)
     POST /api/auth/reset-password       -> cambiar la contrasena con el token
     POST /api/auth/login-recovery       -> entrar directo con el token

   Ninguna de estas rutas lleva authMiddleware: son justamente las que se usan
   ANTES de tener un token de sesion (registrarse, verificar, loguearse, recuperar).
   ============================================================================ */
const authRouter = express.Router()

/* Registro de un nuevo usuario (recibe nombre, email, password, role) */
authRouter.post(
    '/register',
    authController.register
)

/* Verificacion de email. Recibe el token por query (?verification_token=...)
   y al final redirige al frontend. */
authRouter.get(
    '/verify-email',
    authController.verifyEmail
)

/* Login. Recibe email y password, devuelve un JWT si todo es correcto. */
authRouter.post(
    '/login',
    authController.login
)

/* Recuperacion - paso 1: la persona ingresa su email y le mandamos un mail
   con un link al frontend (con un token temporal). */
authRouter.post(
    '/forgot-password',
    authController.forgotPassword
)

/* Recuperacion - opcion A: cambiar la contrasena. Recibe el token + la nueva pass. */
authRouter.post(
    '/reset-password',
    authController.resetPassword
)

/* Recuperacion - opcion B: entrar directo. Recibe el token y devuelve una sesion
   normal (sin cambiar la contrasena). */
authRouter.post(
    '/login-recovery',
    authController.loginWithRecoveryToken
)

export default authRouter
