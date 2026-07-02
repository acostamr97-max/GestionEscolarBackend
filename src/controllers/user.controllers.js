import userService from '../services/user.service.js'

/* ============================================================================
   UserController: endpoints de usuarios (consultas, no auth).
   Maneja request/response y delega la logica en userService.
   ============================================================================ */
class UserController {

    /* GET /api/usuario/docentes  -> lista de docentes para asignar a un aula.
       Devuelve solo datos publicos (id, nombre, email): NUNCA el password ni el
       token de verificacion, aunque vengan en el documento de la base. */
    getDocentes = async (request, response) => {
        try {
            const docentes = await userService.getDocentes()

            /* Mapeo a un formato limpio y seguro para el frontend.
               El frontend usa el "id" de cada docente para mandarlo en el
               campo "docente" al crear un aula. */
            const data = docentes.map((d) => ({
                id: d._id,
                nombre: d.nombre,
                email: d.email
            }))

            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Docentes obtenidos",
                data: { docentes: data }
            })
        } catch (error) {
            console.error('Error al listar docentes:', error)
            return response.status(500).json({
                ok: false,
                status: 500,
                message: "Error interno del servidor"
            })
        }
    }

    getDocentesDisponibles = async (request, response) => {
        try {
            const docentes = await userService.getDocentesDisponibles()
            const data = docentes.map((d) => ({
                id: d._id,
                nombre: d.nombre,
                email: d.email
            }))

            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Docentes disponibles obtenidos",
                data: { docentes: data }
            })
        } catch (error) {
            console.error('Error al listar docentes disponibles:', error)
            return response.status(500).json({
                ok: false,
                status: 500,
                message: "Error interno del servidor"
            })
        }
    }
}

const userController = new UserController()
export default userController
