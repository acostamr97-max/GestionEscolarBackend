import mongoose from 'mongoose'
import { ALUMNO_COLLECTION_NAME } from './alumno.model.js'
import { AULA_COLLECTION_NAME } from './aula.model.js'
import { ASISTENCIA_ESTADOS_LIST, ASISTENCIA_ESTADOS } from '../const/roles.const.js'

const asistenciaSchema = new mongoose.Schema({
    alumno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ALUMNO_COLLECTION_NAME,
        required: true
    },
    aula: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AULA_COLLECTION_NAME,
        required: true
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ASISTENCIA_ESTADOS_LIST,  
        default: ASISTENCIA_ESTADOS.PRESENTE,
        required: true
    }
}, { timestamps: true });


asistenciaSchema.index({ alumno: 1, fecha: 1 }, { unique: true });

export const ASISTENCIA_COLLECTION_NAME = 'Asistencia'
const Asistencia = mongoose.model(ASISTENCIA_COLLECTION_NAME, asistenciaSchema)

export default Asistencia
