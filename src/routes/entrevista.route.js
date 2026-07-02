import express from 'express'
import entrevistaController from '../controllers/entrevista.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const entrevistaRouter = express.Router()

/* La familia solicita una entrevista */
entrevistaRouter.post(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.FAMILIA]),
    entrevistaController.create
)

/* La familia ve sus propias solicitudes.
   Va antes de cualquier ':id' para que 'mias' no se confunda con un id. */
entrevistaRouter.get(
    '/mias',
    authMiddleware,
    roleMiddleware([USER_ROLES.FAMILIA]),
    entrevistaController.getMine
)

/* El director ve todas las entrevistas */
entrevistaRouter.get(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    entrevistaController.getAll
)

/* El director programa o cancela una entrevista */
entrevistaRouter.put(
    '/:entrevista_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    entrevistaController.updateEstado
)

export default entrevistaRouter
