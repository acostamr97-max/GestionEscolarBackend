import ServerError from '../helpers/serverError.helper.js'
import aulaService from '../services/aula.service.js'

/* Controller del Aula: maneja request/response y delega la logica en el service.
   No tiene queries ni reglas de negocio. */
class AulaController {

    /* POST /api/aula  -> crear aula (solo director) */
    create = async (request, response) => {
        try {
            const { nombre, docente, turno, descripcion } = request.body
            const nueva_aula = await aulaService.create({ nombre, docente, turno, descripcion })

            return response.status(201).json({
                ok: true,
                status: 201,
                message: "Aula creada correctamente",
                data: { aula: nueva_aula }
            })
        } catch (error) {
            return this.#handleError(error, response, "crear aula")
        }
    }

    /* GET /api/aula  -> listar todas las aulas (director) */
    getAll = async (request, response) => {
        try {
            const aulas = await aulaService.getAll()
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Aulas obtenidas",
                data: { aulas }
            })
        } catch (error) {
            return this.#handleError(error, response, "listar aulas")
        }
    }

    /* GET /api/aula/mis-aulas  -> aulas del docente logueado */
    getMine = async (request, response) => {
        try {
            const docente_id = request.user.id
            const aulas = await aulaService.getByDocente(docente_id)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Aulas del docente obtenidas",
                data: { aulas }
            })
        } catch (error) {
            return this.#handleError(error, response, "listar mis aulas")
        }
    }

    /* GET /api/aula/:aula_id  -> detalle de un aula */
    getById = async (request, response) => {
        try {
            const aula = await aulaService.getById(request.params.aula_id)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Aula obtenida",
                data: { aula }
            })
        } catch (error) {
            return this.#handleError(error, response, "obtener aula")
        }
    }

    /* PUT /api/aula/:aula_id  -> actualizar (solo director) */
    updateById = async (request, response) => {
        try {
            const aula = await aulaService.updateById(request.params.aula_id, request.body)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Aula actualizada",
                data: { aula }
            })
        } catch (error) {
            return this.#handleError(error, response, "actualizar aula")
        }
    }

    /* DELETE /api/aula/:aula_id  -> baja logica (solo director) */
    deleteById = async (request, response) => {
        try {
            const aula = await aulaService.deleteById(request.params.aula_id)
            return response.status(200).json({
                ok: true,
                status: 200,
                message: "Aula eliminada",
                data: { aula }
            })
        } catch (error) {
            return this.#handleError(error, response, "eliminar aula")
        }
    }

    /* Helper privado para no repetir el manejo de errores en cada metodo */
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

const aulaController = new AulaController()
export default aulaController
