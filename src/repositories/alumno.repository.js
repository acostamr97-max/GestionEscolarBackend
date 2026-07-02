import Alumno from '../models/alumno.model.js'

/* Capa de acceso a datos del Alumno. */
class AlumnoRepository {

    async create(data) {
        return await Alumno.create(data)
    }

    /* Todos los alumnos activos de un aula */
    async getByAula(aula_id) {
        return await Alumno.find({ aula: aula_id, activo: true })
            .populate('familia', 'nombre email')
    }

    async getById(alumno_id) {
        return await Alumno.findById(alumno_id)
            .populate('aula', 'nombre turno')
            .populate('familia', 'nombre email')
    }

    async updateById(alumno_id, update_data) {
        return await Alumno.findByIdAndUpdate(alumno_id, update_data, { new: true })
    }

    /* Baja logica */
    async softDeleteById(alumno_id) {
        return await Alumno.findByIdAndUpdate(alumno_id, { activo: false }, { new: true })
    }

    /* Cuenta alumnos activos de un aula (util para reportes) */
    async countByAula(aula_id) {
        return await Alumno.countDocuments({ aula: aula_id, activo: true })
    }

    async deleteById(alumno_id) {
        return await Alumno.findByIdAndDelete(alumno_id)
    }
}

const alumnoRepository = new AlumnoRepository()
export default alumnoRepository
