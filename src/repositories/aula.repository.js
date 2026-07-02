import Aula from '../models/aula.model.js'

/* Capa de acceso a datos del Aula. Solo habla con la base (queries).
   Nada de logica de negocio ni de validaciones aca. */
class AulaRepository {

    /* Crea un aula */
    async create(data) {
        return await Aula.create(data)
    }

    /* Lista todas las aulas activas, con el docente populado (nombre y email) */
    async getAll() {
        return await Aula.find({ activo: true }).populate('docente', 'nombre email role')
    }

    /* Lista las aulas activas de un docente concreto */
    async getByDocente(docente_id) {
        return await Aula.find({ docente: docente_id, activo: true }).populate('docente', 'nombre email role')
    }

    /* Trae un aula por id, con docente populado */
    async getById(aula_id) {
        return await Aula.findById(aula_id).populate('docente', 'nombre email role')
    }

    /* Actualiza un aula. { new: true } hace que devuelva el documento ya actualizado */
    async updateById(aula_id, update_data) {
        return await Aula.findByIdAndUpdate(aula_id, update_data, { new: true }).populate('docente', 'nombre email role')
    }

    /* Borrado logico: marca activo=false en vez de eliminar el documento */
    async softDeleteById(aula_id) {
        return await Aula.findByIdAndUpdate(aula_id, { activo: false }, { new: true })
    }
}

const aulaRepository = new AulaRepository()
export default aulaRepository
