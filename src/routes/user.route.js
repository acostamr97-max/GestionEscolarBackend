import express from 'express'
import userController from '../controllers/user.controllers.js'
import authMiddleware from '../middleware/auth.middleware.js'
import roleMiddleware from '../middleware/role.middleware.js'
import { USER_ROLES } from '../const/roles.const.js'

/* ============================================================================
   Rutas de usuario. Se montan en main.js bajo /api/usuario.
     GET /api/usuario/docentes -> lista de docentes (para asignar a un aula)
   ============================================================================ */
const userRouter = express.Router()

/* Listar docentes. Solo el director lo necesita (es quien crea aulas y asigna
   docentes), por eso lo protegemos con auth + rol director. */
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
