import ServerError from '../helpers/serverError.helper.js'
import alumnoRepository from '../repositories/alumno.repository.js'
import aulaRepository from '../repositories/aula.repository.js'
import { USER_ROLES } from '../const/roles.const.js'

/* Logica de negocio del Alumno.
   Regla clave: un docente solo puede gestionar alumnos del aula que tiene asignada.
   El director puede gestionar cualquier aula. */
class AlumnoService {

    /* Verifica que el aula exista y que el usuario tenga permiso sobre ella.
       Devuelve el aula si todo ok; si no, tira error. */
    async #checkAulaPermiso(aula_id, user) {
        const aula = await aulaRepository.getById(aula_id)
        if (!aula) {
            throw new ServerError("Aula no encontrada", 404)
        }

        /* El director puede con cualquier aula. El docente solo con la suya. */
        if (user.role === USER_ROLES.DOCENTE) {
            /* aula.docente viene populado, comparo contra su _id */
            const docente_id = aula.docente?._id ? aula.docente._id.toString() : aula.docente.toString()
            if (docente_id !== user.id) {
                throw new ServerError("No podes gestionar alumnos de un aula que no es tuya", 403)
            }
        }
        return aula
    }

    /* Agregar un alumno a un aula */
    async create({ nombre, apellido, dni, aula, familia }, user) {
        if (!nombre || nombre.trim().length < 2) {
            throw new ServerError("El nombre del alumno es obligatorio", 400)
        }
        if (!apellido || apellido.trim().length < 2) {
            throw new ServerError("El apellido del alumno es obligatorio", 400)
        }
        if (!aula) {
            throw new ServerError("Debe indicarse el aula del alumno", 400)
        }

        await this.#checkAulaPermiso(aula, user)

        return await alumnoRepository.create({ nombre, apellido, dni, aula, familia: familia || null })
    }

    /* Listar alumnos de un aula */
    async getByAula(aula_id, user) {
        await this.#checkAulaPermiso(aula_id, user)
        return await alumnoRepository.getByAula(aula_id)
    }

    /* Detalle de un alumno */
    async getById(alumno_id, user) {
        const alumno = await alumnoRepository.getById(alumno_id)
        if (!alumno) {
            throw new ServerError("Alumno no encontrado", 404)
        }
        /* valido permiso sobre el aula del alumno */
        const aula_id = alumno.aula?._id ? alumno.aula._id.toString() : alumno.aula.toString()
        await this.#checkAulaPermiso(aula_id, user)
        return alumno
    }

    /* Actualizar datos de un alumno */
    async updateById(alumno_id, data, user) {
        const alumno = await alumnoRepository.getById(alumno_id)
        if (!alumno) {
            throw new ServerError("Alumno no encontrado", 404)
        }

        const aula_actual = alumno.aula?._id ? alumno.aula._id.toString() : alumno.aula.toString()
        await this.#checkAulaPermiso(aula_actual, user)

        const update_data = {}
        if (data.nombre !== undefined) update_data.nombre = data.nombre
        if (data.apellido !== undefined) update_data.apellido = data.apellido
        if (data.dni !== undefined) update_data.dni = data.dni
        if (data.familia !== undefined) update_data.familia = data.familia

        /* Si se mueve de aula, validar permiso sobre la nueva aula tambien */
        if (data.aula !== undefined && data.aula !== aula_actual) {
            await this.#checkAulaPermiso(data.aula, user)
            update_data.aula = data.aula
        }

        if (Object.keys(update_data).length === 0) {
            throw new ServerError("Enviar al menos un campo para actualizar", 400)
        }

        return await alumnoRepository.updateById(alumno_id, update_data)
    }

    /* Quitar un alumno (baja logica) */
    async deleteById(alumno_id, user) {
        const alumno = await alumnoRepository.getById(alumno_id)
        if (!alumno) {
            throw new ServerError("Alumno no encontrado", 404)
        }
        const aula_id = alumno.aula?._id ? alumno.aula._id.toString() : alumno.aula.toString()
        await this.#checkAulaPermiso(aula_id, user)
        return await alumnoRepository.deleteById(alumno_id)
    }
}

const alumnoService = new AlumnoService()
export default alumnoService
