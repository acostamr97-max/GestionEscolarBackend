import userService from '../services/user.service.js'

class UserController {
    getDocentes = async (request, response) => {
        try {
            const docentes = await userService.getDocentes()
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
