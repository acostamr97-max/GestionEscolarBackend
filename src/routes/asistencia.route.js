import express from 'express'
import asistenciaController from '../controllers/asistencia.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const asistenciaRouter = express.Router()

const docenteODirector = roleMiddleware([USER_ROLES.DIRECTOR, USER_ROLES.DOCENTE])

/* Registrar asistencia */
asistenciaRouter.post('/', authMiddleware, docenteODirector, asistenciaController.create)

/* Asistencia de un aula en una fecha (?fecha=YYYY-MM-DD) */
asistenciaRouter.get('/aula/:aula_id', authMiddleware, docenteODirector, asistenciaController.getByAulaAndFecha)

/* Historial de asistencia de un alumno */
asistenciaRouter.get('/alumno/:alumno_id', authMiddleware, docenteODirector, asistenciaController.getByAlumno)

/* Corregir una asistencia */
asistenciaRouter.put('/:asistencia_id', authMiddleware, docenteODirector, asistenciaController.updateById)

export default asistenciaRouter
