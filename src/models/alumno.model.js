import mongoose from 'mongoose'
import { AULA_COLLECTION_NAME } from './aula.model.js'
import { USER_COLLECTION_NAME } from './user.model.js'

const alumnoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
   
    dni: {
        type: String,
        unique: true,
        sparse: true   
    },
   
    aula: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AULA_COLLECTION_NAME,
        required: true
    },

    familia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        default: null
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const ALUMNO_COLLECTION_NAME = 'Alumno'
const Alumno = mongoose.model(ALUMNO_COLLECTION_NAME, alumnoSchema)

export default Alumno
