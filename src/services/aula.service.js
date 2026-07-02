import ServerError from '../helpers/serverError.helper.js'
import aulaRepository from '../repositories/aula.repository.js'
import userRepository from '../repositories/user.repository.js'
import { USER_ROLES } from '../const/roles.const.js'

class AulaService {

    async create({ nombre, docente, turno, descripcion }) {
        if (!nombre || nombre.trim().length < 2) {
            throw new ServerError("El nombre del aula debe tener al menos 2 caracteres", 400)
        }

        if (docente) {
            const docente_user = await userRepository.getById(docente)
            if (!docente_user) {
                throw new ServerError("El docente indicado no existe", 404)
            }
            if (docente_user.role !== USER_ROLES.DOCENTE) {
                throw new ServerError("El usuario asignado no tiene rol de docente", 400)
            }
        }

        return await aulaRepository.create({ nombre, docente: docente || null, turno, descripcion })
    }

    async getAll() {
        return await aulaRepository.getAll()
    }

    async getByDocente(docente_id) {
        return await aulaRepository.getByDocente(docente_id)
    }

    async getById(aula_id) {
        const aula = await aulaRepository.getById(aula_id)
        if (!aula) {
            throw new ServerError("Aula no encontrada", 404)
        }
        return aula
    }

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
