import ServerError from '../helpers/serverError.helper.js'
import asistenciaService from '../services/asistencia.service.js'

class AsistenciaController {
    create = async (request, response) => {
        try {
            const asistencia = await asistenciaService.create(request.body, request.user)
            return response.status(201).json({
                ok: true,
                status: 201,
                message: "Asistencia registrada",
                data: { asistencia }
            })
        } catch (error) {
            return this.#handleError(error, response, "registrar asistencia")
        }
    }
    getByAulaAndFecha = async (request, response) => {
        try {
            const { fecha } = request.query
            const asistencias = await asistenciaService.getByAulaAndFecha(request.params.aula_id, fecha, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Asistencia del aula obtenida",
                data: { asistencias }
            })
        } catch (error) {
            return this.#handleError(error, response, "obtener asistencia del aula")
        }
    }

    getByAlumno = async (request, response) => {
        try {
            const asistencias = await asistenciaService.getByAlumno(request.params.alumno_id, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Historial de asistencia obtenido",
                data: { asistencias }
            })
        } catch (error) {
            return this.#handleError(error, response, "obtener historial de asistencia")
        }
    }

    updateById = async (request, response) => {
        try {
            const asistencia = await asistenciaService.updateById(request.params.asistencia_id, request.body, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Asistencia actualizada",
                data: { asistencia }
            })
        } catch (error) {
            return this.#handleError(error, response, "actualizar asistencia")
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

const asistenciaController = new AsistenciaController()
export default asistenciaController
