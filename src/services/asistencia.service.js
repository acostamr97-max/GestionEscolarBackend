import ServerError from '../helpers/serverError.helper.js'
import asistenciaRepository from '../repositories/asistencia.repository.js'
import alumnoRepository from '../repositories/alumno.repository.js'
import aulaRepository from '../repositories/aula.repository.js'
import { USER_ROLES, ASISTENCIA_ESTADOS_LIST, ASISTENCIA_ESTADOS } from '../const/roles.const.js'

/* Logica de negocio de Asistencia.
   El docente registra presente/ausente de alumnos de SU aula, por fecha. */
class AsistenciaService {

    /* Devuelve el inicio y fin del dia para una fecha dada (para buscar/evitar duplicados) */
    #rangoDelDia(fecha) {
        const base = fecha ? new Date(fecha) : new Date()
        const desde = new Date(base)
        desde.setHours(0, 0, 0, 0)
        const hasta = new Date(base)
        hasta.setHours(23, 59, 59, 999)
        return { desde, hasta }
    }

    /* Verifica permiso del usuario sobre el aula (igual logica que en alumnos) */
    async #checkAulaPermiso(aula_id, user) {
        const aula = await aulaRepository.getById(aula_id)
        if (!aula) {
            throw new ServerError("Aula no encontrada", 404)
        }
        if (user.role === USER_ROLES.DOCENTE) {
            const docente_id = aula.docente?._id ? aula.docente._id.toString() : aula.docente.toString()
            if (docente_id !== user.id) {
                throw new ServerError("No podes registrar asistencia de un aula que no es tuya", 403)
            }
        }
        return aula
    }

    /* Registrar la asistencia de un alumno en una fecha */
    async create({ alumno, fecha, estado }, user) {
        if (!alumno) {
            throw new ServerError("Debe indicarse el alumno", 400)
        }
        if (estado && !ASISTENCIA_ESTADOS_LIST.includes(estado)) {
            throw new ServerError("Estado invalido. Debe ser: " + ASISTENCIA_ESTADOS_LIST.join(', '), 400)
        }

        /* Busco el alumno para obtener su aula y validar permiso */
        const alumno_doc = await alumnoRepository.getById(alumno)
        if (!alumno_doc) {
            throw new ServerError("Alumno no encontrado", 404)
        }
        const aula_id = alumno_doc.aula?._id ? alumno_doc.aula._id.toString() : alumno_doc.aula.toString()
        await this.#checkAulaPermiso(aula_id, user)

        /* Evito duplicar la asistencia del mismo alumno en el mismo dia */
        const { desde, hasta } = this.#rangoDelDia(fecha)
        const existente = await asistenciaRepository.findByAlumnoAndFecha(alumno, desde, hasta)
        if (existente) {
            throw new ServerError("Ya se registro la asistencia de este alumno para esa fecha", 400)
        }

        return await asistenciaRepository.create({
            alumno,
            aula: aula_id,
            fecha: fecha ? new Date(fecha) : new Date(),
            estado: estado || ASISTENCIA_ESTADOS.PRESENTE
        })
    }

    /* Asistencia de un aula en una fecha */
    async getByAulaAndFecha(aula_id, fecha, user) {
        await this.#checkAulaPermiso(aula_id, user)
        const { desde, hasta } = this.#rangoDelDia(fecha)
        return await asistenciaRepository.getByAulaAndFecha(aula_id, desde, hasta)
    }

    /* Historial de un alumno */
    async getByAlumno(alumno_id, user) {
        const alumno_doc = await alumnoRepository.getById(alumno_id)
        if (!alumno_doc) {
            throw new ServerError("Alumno no encontrado", 404)
        }
        const aula_id = alumno_doc.aula?._id ? alumno_doc.aula._id.toString() : alumno_doc.aula.toString()
        await this.#checkAulaPermiso(aula_id, user)
        return await asistenciaRepository.getByAlumno(alumno_id)
    }

    /* Corregir una asistencia ya cargada (cambiar estado) */
    async updateById(asistencia_id, { estado }, user) {
        const asistencia = await asistenciaRepository.getById(asistencia_id)
        if (!asistencia) {
            throw new ServerError("Registro de asistencia no encontrado", 404)
        }
        if (!estado || !ASISTENCIA_ESTADOS_LIST.includes(estado)) {
            throw new ServerError("Estado invalido. Debe ser: " + ASISTENCIA_ESTADOS_LIST.join(', '), 400)
        }
        await this.#checkAulaPermiso(asistencia.aula.toString(), user)
        return await asistenciaRepository.updateById(asistencia_id, { estado })
    }
}

const asistenciaService = new AsistenciaService()
export default asistenciaService
