import ServerError from "../helpers/serverError.helper.js";

/* Middleware factory de autorizacion por rol.
   Se usa DESPUES de authMiddleware (que ya puso request.user con los datos del token).
   Recibe una lista de roles permitidos y deja pasar solo si el usuario tiene uno de ellos.

   Uso en una ruta:
     router.post('/', authMiddleware, roleMiddleware(['director']), controller.create)
*/
function roleMiddleware(allowedRoles = []) {
    return (request, response, next) => {
        try {
            const user = request.user;

            if (!user || !user.role) {
                throw new ServerError("No se pudo determinar el rol del usuario", 401);
            }

            if (allowedRoles.length && !allowedRoles.includes(user.role)) {
                throw new ServerError("No tenes permisos para realizar esta accion", 403);
            }

            return next();
        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    message: error.message,
                    ok: false,
                    status: error.status
                });
            }
            console.error('Error en roleMiddleware:', error);
            return response.status(500).json({
                message: "Error interno del servidor",
                ok: false,
                status: 500
            });
        }
    };
}

export default roleMiddleware;
