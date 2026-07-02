import express from 'express'
import alumnoController from '../controllers/alumno.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const alumnoRouter = express.Router()

const docenteODirector = roleMiddleware([USER_ROLES.DIRECTOR, USER_ROLES.DOCENTE])

alumnoRouter.post('/', authMiddleware, docenteODirector, alumnoController.create)
alumnoRouter.get('/aula/:aula_id', authMiddleware, docenteODirector, alumnoController.getByAula)
alumnoRouter.get('/:alumno_id', authMiddleware, docenteODirector, alumnoController.getById)
alumnoRouter.put('/:alumno_id', authMiddleware, docenteODirector, alumnoController.updateById)
alumnoRouter.delete('/:alumno_id', authMiddleware, docenteODirector, alumnoController.deleteById)

export default alumnoRouter
