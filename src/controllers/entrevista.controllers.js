import ServerError from '../helpers/serverError.helper.js'
import entrevistaService from '../services/entrevista.service.js'

class EntrevistaController {

    /* POST /api/entrevista  -> la familia solicita una entrevista */
    create = async (request, response) => {
        try {
            const entrevista = await entrevistaService.create(request.body, request.user)
            return response.status(201).json({
                ok: true,
                status: 201,
                message: "Solicitud de entrevista enviada",
                data: { entrevista }
            })
        } catch (error) {
            return this.#handleError(error, response, "solicitar entrevista")
        }
    }

    /* GET /api/entrevista  -> todas las entrevistas (director) */
    getAll = async (request, response) => {
        try {
            const entrevistas = await entrevistaService.getAll()
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Entrevistas obtenidas",
                data: { entrevistas }
            })
        } catch (error) {
            return this.#handleError(error, response, "listar entrevistas")
        }
    }

    /* GET /api/entrevista/mias  -> entrevistas de la familia logueada */
    getMine = async (request, response) => {
        try {
            const entrevistas = await entrevistaService.getMine(request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Tus entrevistas obtenidas",
                data: { entrevistas }
            })
        } catch (error) {
            return this.#handleError(error, response, "listar mis entrevistas")
        }
    }

    /* PUT /api/entrevista/:entrevista_id  -> el director programa/cancela */
    updateEstado = async (request, response) => {
        try {
            const entrevista = await entrevistaService.updateEstado(request.params.entrevista_id, request.body, request.user)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Entrevista actualizada",
                data: { entrevista }
            })
        } catch (error) {
            return this.#handleError(error, response, "actualizar entrevista")
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

const entrevistaController = new EntrevistaController()
export default entrevistaController
