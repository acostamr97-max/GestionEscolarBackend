import express from 'express'
import alumnoController from '../controllers/alumno.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const alumnoRouter = express.Router()

/* Director y docente pueden gestionar alumnos.
   La validacion fina (que el docente solo toque SU aula) se hace en el service. */
const docenteODirector = roleMiddleware([USER_ROLES.DIRECTOR, USER_ROLES.DOCENTE])

/* Agregar alumno */
alumnoRouter.post('/', authMiddleware, docenteODirector, alumnoController.create)

/* Alumnos de un aula */
alumnoRouter.get('/aula/:aula_id', authMiddleware, docenteODirector, alumnoController.getByAula)

/* Detalle de alumno */
alumnoRouter.get('/:alumno_id', authMiddleware, docenteODirector, alumnoController.getById)

/* Actualizar alumno */
alumnoRouter.put('/:alumno_id', authMiddleware, docenteODirector, alumnoController.updateById)

/* Quitar alumno (baja logica) */
alumnoRouter.delete('/:alumno_id', authMiddleware, docenteODirector, alumnoController.deleteById)

export default alumnoRouter
