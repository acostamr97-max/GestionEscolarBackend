import ServerError from '../helpers/serverError.helper.js'
import aulaRepository from '../repositories/aula.repository.js'
import userRepository from '../repositories/user.repository.js'
import { USER_ROLES } from '../const/roles.const.js'

class AulaService {

    async create({ nombre, docente, turno, descripcion }) {
        if (!nombre || nombre.trim().length < 2) {
            throw new ServerError("El nombre del aula debe tener al menos 2 caracteres", 400)
        }

        /* Solo validamos el docente si efectivamente se envio uno */
        if (docente) {
            const docente_user = await userRepository.getById(docente)
            if (!docente_user) {
                throw new ServerError("El docente indicado no existe", 404)
            }
            if (docente_user.role !== USER_ROLES.DOCENTE) {
                throw new ServerError("El usuario asignado no tiene rol de docente", 400)
            }
        }

        /* Si docente vino vacio o undefined, lo guardamos como null */
        return await aulaRepository.create({ nombre, docente: docente || null, turno, descripcion })
    }

    /* Lista todas las aulas (vista del director) */
    async getAll() {
        return await aulaRepository.getAll()
    }

    /* Lista las aulas de un docente (vista del docente sobre lo suyo) */
    async getByDocente(docente_id) {
        return await aulaRepository.getByDocente(docente_id)
    }

    /* Trae un aula puntual, error si no existe */
    async getById(aula_id) {
        const aula = await aulaRepository.getById(aula_id)
        if (!aula) {
            throw new ServerError("Aula no encontrada", 404)
        }
        return aula
    }

    /* Actualiza un aula. Solo toca los campos enviados. */
    async updateById(aula_id, { nombre, turno, descripcion, docente }) {
        const aula = await aulaRepository.getById(aula_id)
        if (!aula) {
            throw new ServerError("Aula no encontrada", 404)
        }

        const update_data = {}

        if (nombre !== undefined) {
            if (nombre.trim().length < 2) {
                throw new ServerError("El nombre debe tener al menos 2 caracteres", 400)
            }
            update_data.nombre = nombre
        }
        if (turno !== undefined) update_data.turno = turno
        if (descripcion !== undefined) update_data.descripcion = descripcion

        /* Si se quiere cambiar el docente:
           - si viene un id, validamos que sea un docente real y lo asignamos;
           - si viene vacio o null, desasignamos (el aula queda sin docente). */
        if (docente !== undefined) {
            if (docente) {
                const docente_user = await userRepository.getById(docente)
                if (!docente_user || docente_user.role !== USER_ROLES.DOCENTE) {
                    throw new ServerError("El docente indicado no es valido", 400)
                }
                update_data.docente = docente
            } else {
                update_data.docente = null
            }
        }

        if (Object.keys(update_data).length === 0) {
            throw new ServerError("Enviar al menos un campo para actualizar", 400)
        }

        return await aulaRepository.updateById(aula_id, update_data)
    }

    /* Baja logica del aula */
    async deleteById(aula_id) {
        const aula = await aulaRepository.getById(aula_id)
        if (!aula) {
            throw new ServerError("Aula no encontrada", 404)
        }
        return await aulaRepository.softDeleteById(aula_id)
    }
}

const aulaService = new AulaService()
export default aulaService
