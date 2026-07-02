import express from 'express'
import authController from '../controllers/auth.controllers.js'

const authRouter = express.Router()

authRouter.post(
    '/register',
    authController.register
)

authRouter.get(
    '/verify-email',
    authController.verifyEmail
)

authRouter.post(
    '/login',
    authController.login
)

authRouter.post(
    '/forgot-password',
    authController.forgotPassword
)


authRouter.post(
    '/reset-password',
    authController.resetPassword
)

authRouter.post(
    '/login-recovery',
    authController.loginWithRecoveryToken
)

export default authRouter
