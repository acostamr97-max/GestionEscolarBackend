import express from 'express'
import entrevistaController from '../controllers/entrevista.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const entrevistaRouter = express.Router()

entrevistaRouter.post(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.FAMILIA]),
    entrevistaController.create
)

entrevistaRouter.get(
    '/mias',
    authMiddleware,
    roleMiddleware([USER_ROLES.FAMILIA]),
    entrevistaController.getMine
)

entrevistaRouter.get(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    entrevistaController.getAll
)

entrevistaRouter.put(
    '/:entrevista_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    entrevistaController.updateEstado
)

export default entrevistaRouter
