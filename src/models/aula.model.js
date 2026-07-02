import mongoose from 'mongoose'
import { USER_COLLECTION_NAME } from './user.model.js'

/* Aula: entidad principal del sistema.
   Cada aula tiene un docente asignado (referencia a User con role 'docente').
   El director (admin) es quien crea, edita y elimina aulas. */
const aulaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    /* Docente a cargo del aula. Es una FK a User.
       Es OPCIONAL: el aula puede crearse sin docente y asignarselo despues
       (con un PUT). Mientras no tenga, queda en null. */
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
    /* Borrado logico: en vez de borrar el documento, se pone activo=false */
    activo: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const AULA_COLLECTION_NAME = 'Aula'
const Aula = mongoose.model(AULA_COLLECTION_NAME, aulaSchema)

export default Aula
