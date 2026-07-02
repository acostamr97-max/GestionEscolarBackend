import ServerError from '../helpers/serverError.helper.js'
import alumnoService from '../services/alumno.service.js'

/* Controller del Alumno. Pasa request.user al service para que valide permisos por aula. */
class AlumnoController {

    /* POST /api/alumno  -> agregar alumno a un aula */
    create = async (request, response) => {
        try {
            const alumno = await alumnoService.create(request.body, request.user)
            return response.status(201).json({
                ok: true,
                status: 201,
                message: "Alumno agregado correctamente",
                data: { alumno }
            })
        } catch (error) {
            return this.#handleError(error, response, "agregar alumno")
        }
    }

    /* GET /api/alumno/aula/:aula_id  -> alumnos de un aula */
    getByAula = async (request, response) => {
        try {
            const alumnos = await alumnoService.getByAula(request.params.aula_id, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Alumnos del aula obtenidos",
                data: { alumnos }
            })
        } catch (error) {
            return this.#handleError(error, response, "listar alumnos")
        }
    }

    /* GET /api/alumno/:alumno_id  -> detalle */
    getById = async (request, response) => {
        try {
            const alumno = await alumnoService.getById(request.params.alumno_id, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Alumno obtenido",
                data: { alumno }
            })
        } catch (error) {
            return this.#handleError(error, response, "obtener alumno")
        }
    }

    /* PUT /api/alumno/:alumno_id  -> actualizar */
    updateById = async (request, response) => {
        try {
            const alumno = await alumnoService.updateById(request.params.alumno_id, request.body, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Alumno actualizado",
                data: { alumno }
            })
        } catch (error) {
            return this.#handleError(error, response, "actualizar alumno")
        }
    }

    /* DELETE /api/alumno/:alumno_id  -> quitar (baja logica) */
    deleteById = async (request, response) => {
        try {
            const alumno = await alumnoService.deleteById(request.params.alumno_id, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Alumno quitado del aula",
                data: { alumno }
            })
        } catch (error) {
            return this.#handleError(error, response, "quitar alumno")
        }
    }

    #handleError(error, response, accion) {
        if (error instanceof ServerError) {
            return response.status(error.status).json({
                ok: false,
                status: error.status,
                message: error.message
            })
        }
        console.error(`Error al ${accion}:`, error)
        return response.status(500).json({
            ok: false,
            status: 500,
            message: "Error interno del servidor"
        })
    }
}

const alumnoController = new AlumnoController()
export default alumnoController
