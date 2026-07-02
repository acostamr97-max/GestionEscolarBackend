import mongoose from 'mongoose'
import { USER_COLLECTION_NAME } from './user.model.js'

const aulaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
   
    docente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        default: null
    },
    turno: {
        type: String,
        enum: ['maniana', 'tarde', 'noche'],
        default: 'maniana'
    },
    descripcion: {
        type: String,
        default: ''
    },
 
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const AULA_COLLECTION_NAME = 'Aula'
const Aula = mongoose.model(AULA_COLLECTION_NAME, aulaSchema)

export default Aula
