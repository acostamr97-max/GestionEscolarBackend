import express from 'express'
import userController from '../controllers/user.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

const userRouter = express.Router()

userRouter.get(
    '/docentes',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    userController.getDocentes
)

userRouter.get(
    '/docentes-disponibles',
    authMiddleware,
    roleMiddleware([USER_ROLES.DIRECTOR]),
    userController.getDocentesDisponibles
)

export default userRouter
