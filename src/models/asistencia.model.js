import mongoose from 'mongoose'
import { ALUMNO_COLLECTION_NAME } from './alumno.model.js'
import { AULA_COLLECTION_NAME } from './aula.model.js'
import { ASISTENCIA_ESTADOS_LIST, ASISTENCIA_ESTADOS } from '../const/roles.const.js'

/* Asistencia: el docente registra, por fecha, si cada alumno estuvo presente o ausente.
   Guarda tambien el aula para poder filtrar/reportar comodo. */
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
        enum: ASISTENCIA_ESTADOS_LIST,   /* 'presente' | 'ausente' */
        default: ASISTENCIA_ESTADOS.PRESENTE,
        required: true
    }
}, { timestamps: true });

/* Evita cargar dos veces la asistencia del mismo alumno en el mismo dia.
   (Nota: compara la fecha exacta; si guardas solo el dia sin hora funciona perfecto.) */
asistenciaSchema.index({ alumno: 1, fecha: 1 }, { unique: true });

export const ASISTENCIA_COLLECTION_NAME = 'Asistencia'
const Asistencia = mongoose.model(ASISTENCIA_COLLECTION_NAME, asistenciaSchema)

export default Asistencia
