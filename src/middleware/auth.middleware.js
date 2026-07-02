import ServerError from "../helpers/serverError.helper.js";
import { ENVIRONMENT } from "../config/environment.config.js";
import jwt from 'jsonwebtoken'

/* ============================================================================
   authMiddleware: middleware de AUTENTICACION.
   Se coloca en las rutas que requieren estar logueado. Su trabajo es:
     1. Leer el token del header "Authorization".
     2. Verificar que sea valido (firma correcta y no vencido).
     3. Dejar los datos del usuario en request.user para que los siguientes
        middlewares/controllers los puedan usar (ej: el roleMiddleware lee
        request.user.role).

   Formato esperado del header:  Authorization: Bearer <token>
   Por eso hacemos split(' ')[1]: separamos "Bearer" del token en si.

   IMPORTANTE: este middleware solo valida QUIEN sos (autenticacion).
   La validacion de QUE podes hacer segun tu rol (autorizacion) la hace
   roleMiddleware, que va despues de este.
   ============================================================================ */
function authMiddleware(request, response, next) {
    try {
        /* 1. Tiene que venir el header de autorizacion */
        const authorization_header = request.headers.authorization
        if(!authorization_header){
            throw new ServerError('No hay header de autorizacion', 401)
        }

        /* 2. El header tiene forma "Bearer <token>". Nos quedamos con el token. */
        const authorization_token = authorization_header.split(' ')[1]
        if(!authorization_token){
            throw new ServerError('No hay token de autorizacion', 401)
        }

        /* 3. Verifico el token: jwt.verify chequea la firma con el secreto y la
              expiracion. Si algo no cierra, lanza una excepcion. Si esta ok,
              devuelve el payload (los datos que pusimos al firmarlo en el login). */
        const user_info = jwt.verify(
            authorization_token,
            ENVIRONMENT.JWT_SECRET
        )

        /* 4. Guardo los datos del usuario en el request para los siguientes pasos.
              Asi el controller sabe quien hizo la peticion (id, email, role...). */
        request.user = user_info

        /* next() le pasa el control al siguiente middleware o al controller */
        return next()
    }
    catch (error) {
        /* Token vencido o invalido -> 401 (no autorizado) */
        if( error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError){
            return response.status(401).json({
                message: 'Token expirado o invalido',
                ok: false,
                status: 401
            })
        }
        /* Errores que lanzamos nosotros (falta header/token) */
        else if (error instanceof ServerError) {
            return response.status(error.status).json(
                {
                    message: error.message,
                    ok: false,
                    status: error.status
                }
            )
        }
        /* Cualquier otra cosa inesperada -> 500 */
        else {
            console.error('Error critico:', error);
            return response.status(500).json({
                message: "Error interno del servidor",
                ok: false,
                status: 500
            });
        }
    }
}

export default authMiddleware
