import express from 'express'
import aulaController from '../controllers/aula.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const aulaRouter = express.Router()

/* Todas las rutas requieren estar logueado (authMiddleware).
   Las sensibles (crear/editar/borrar) ademas exigen rol director (roleMiddleware). */

/* Crear aula - solo director */
aulaRouter.post(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.create
)

/* Listar todas las aulas - solo director */
aulaRouter.get(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.getAll
)

/* Aulas del docente logueado - solo docente.
   Va ANTES de '/:aula_id' para que 'mis-aulas' no se confunda con un id. */
aulaRouter.get(
    '/mis-aulas',
    authMiddleware,
    roleMiddleware([USER_ROLES.DOCENTE]),
    aulaController.getMine
)

/* Detalle de un aula - director o docente */
aulaRouter.get(
    '/:aula_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR, USER_ROLES.DOCENTE]),
    aulaController.getById
)

/* Actualizar aula - solo director */
aulaRouter.put(
    '/:aula_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.updateById
)

/* Eliminar (baja logica) aula - solo director */
aulaRouter.delete(
    '/:aula_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.deleteById
)

export default aulaRouter
