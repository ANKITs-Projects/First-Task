const route = require('express').Router()

const AuthMiddleware = require('../middlewares/authMiddleware')
const apiValidator = require('./../middlewares/apiValidatorMiddleware')

const {signupValidation, loginValidation} = require('../validators/authValidation')

const {authController} = require('../container')
const { authRateLimiter } = require('../middlewares/apiRateLimiterMiddleware')


 

route.post('/signup', authRateLimiter, signupValidation, apiValidator, authController.signUp)
route.post('/login', authRateLimiter, loginValidation, apiValidator, authController.login)

route.get('/generatenewtoken', AuthMiddleware.verifyRefreshToken, authController.generateNewToken)

route.get('/profile', AuthMiddleware.verifyToken, authController.profile)

route.get('/send-email-verification',  AuthMiddleware.verifyToken, authController.sendEmailVerification)
route.get('/verify-email/:token',  authController.verifyemail)

route.post('/forgetPassword', authRateLimiter, authController.forgetPassword)
route.get('/verify-password-token/:token',  authController.verifyPasswordToken)
route.patch('/change-password/:token',  authController.changePassword)

route.post('/logout', authController.userLogout)



module.exports = route