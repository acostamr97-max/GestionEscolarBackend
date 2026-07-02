import Asistencia from '../models/asistencia.model.js'

class AsistenciaRepository {

    async create(data) {
        return await Asistencia.create(data)
    }

    async getByAulaAndFecha(aula_id, desde, hasta) {
        return await Asistencia.find({
            aula: aula_id,
            fecha: { $gte: desde, $lte: hasta }
        }).populate('alumno', 'nombre apellido')
    }

    async getByAlumno(alumno_id) {
        return await Asistencia.find({ alumno: alumno_id }).sort({ fecha: -1 })
    }

    async getById(asistencia_id) {
        return await Asistencia.findById(asistencia_id).populate('alumno', 'nombre apellido')
    }

    async updateById(asistencia_id, update_data) {
        return await Asistencia.findByIdAndUpdate(asistencia_id, update_data, { new: true })
    }

    async findByAlumnoAndFecha(alumno_id, desde, hasta) {
        return await Asistencia.findOne({
            alumno: alumno_id,
            fecha: { $gte: desde, $lte: hasta }
        })
    }
}

const asistenciaRepository = new AsistenciaRepository()
export default asistenciaRepository
