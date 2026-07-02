import Aula from '../models/aula.model.js'

class AulaRepository {

    async create(data) {
        return await Aula.create(data)
    }

    async getAll() {
        return await Aula.find({ activo: true }).populate('docente', 'nombre email role')
    }


    async getByDocente(docente_id) {
        return await Aula.find({ docente: docente_id, activo: true }).populate('docente', 'nombre email role')
    }


    async getById(aula_id) {
        return await Aula.findById(aula_id).populate('docente', 'nombre email role')
    }


    async updateById(aula_id, update_data) {
        return await Aula.findByIdAndUpdate(aula_id, update_data, { new: true }).populate('docente', 'nombre email role')
    }


    async softDeleteById(aula_id) {
        return await Aula.findByIdAndUpdate(aula_id, { activo: false }, { new: true })
    }
}

const aulaRepository = new AulaRepository()
export default aulaRepository
