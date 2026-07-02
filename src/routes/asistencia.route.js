import express from 'express'
import asistenciaController from '../controllers/asistencia.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const asistenciaRouter = express.Router()

const docenteODirector = roleMiddleware([USER_ROLES.DIRECTOR, USER_ROLES.DOCENTE])

asistenciaRouter.post('/', authMiddleware, docenteODirector, asistenciaController.create)
asistenciaRouter.get('/aula/:aula_id', authMiddleware, docenteODirector, asistenciaController.getByAulaAndFecha)
asistenciaRouter.get('/alumno/:alumno_id', authMiddleware, docenteODirector, asistenciaController.getByAlumno)
asistenciaRouter.put('/:asistencia_id', authMiddleware, docenteODirector, asistenciaController.updateById)

export default asistenciaRouter
