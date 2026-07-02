import express from 'express'
import aulaController from '../controllers/aula.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const aulaRouter = express.Router()

aulaRouter.post(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.create
)

aulaRouter.get(
    '/',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.getAll
)


aulaRouter.get(
    '/mis-aulas',
    authMiddleware,
    roleMiddleware([USER_ROLES.DOCENTE]),
    aulaController.getMine
)

aulaRouter.get(
    '/:aula_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR, USER_ROLES.DOCENTE]),
    aulaController.getById
)

aulaRouter.put(
    '/:aula_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.updateById
)

aulaRouter.delete(
    '/:aula_id',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    aulaController.deleteById
)

export default aulaRouter
