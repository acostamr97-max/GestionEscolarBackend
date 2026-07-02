import Entrevista from '../models/entrevistas.model.js'

class EntrevistaRepository {

    async create(data) {
        return await Entrevista.create(data)
    }

    async getAll() {
        return await Entrevista.find()
            .populate('familia', 'nombre email')
            .populate('director', 'nombre email')
            .sort({ fecha: -1 })
    }

    async getByFamilia(familia_id) {
        return await Entrevista.find({ familia: familia_id })
            .populate('director', 'nombre email')
            .sort({ fecha: -1 })
    }

    async getById(entrevista_id) {
        return await Entrevista.findById(entrevista_id)
            .populate('familia', 'nombre email')
            .populate('director', 'nombre email')
    }

    async updateById(entrevista_id, update_data) {
        return await Entrevista.findByIdAndUpdate(entrevista_id, update_data, { new: true })
            .populate('familia', 'nombre email')
            .populate('director', 'nombre email')
    }
}

const entrevistaRepository = new EntrevistaRepository()
export default entrevistaRepository
