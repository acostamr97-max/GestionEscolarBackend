import mongoose from 'mongoose'
import { AULA_COLLECTION_NAME } from './aula.model.js'
import { USER_COLLECTION_NAME } from './user.model.js'

/* Alumno: NO es un usuario con login. Es un registro que administra el docente.
   Pertenece a una sola aula a la vez (FK a Aula).
   Opcionalmente puede estar vinculado a una familia (FK a User con role 'familia'). */
const alumnoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    /* DNI opcional pero unico si se carga */
    dni: {
        type: String,
        unique: true,
        sparse: true   /* permite varios documentos sin dni sin romper el unique */
    },
    /* Aula a la que pertenece el alumno */
    aula: {
        type: mongoose.Schema.Types.ObjectId,
        ref: AULA_COLLECTION_NAME,
        required: true
    },
    /* Familia responsable (opcional) */
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
