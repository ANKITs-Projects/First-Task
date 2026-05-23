const route = require('express').Router()
const upload = require('../middlewares/multer.middleware')
const AuthMiddleware = require('../middlewares/auth.middleware')
const apiValidator = require('./../middlewares/apiValidator.middleware')
const {signupValidation, loginValidation} = require('../utils/validation/authValidation')

const userModel = require('../models/user.model')
const AuthServices = require('./../services/auth.service')
const AuthController = require('./../controllers/auth.controller')

const authService = new AuthServices(userModel)
const authController = new AuthController(authService)




// route.post('/signup', upload.fields([{name: "avatar", maxCount:1}, {name: "banner", maxCount:1}]), signupValidation, apiValidator, authController.signup)

route.post('/signup', signupValidation, apiValidator, authController.signup)
route.post('/login', loginValidation, apiValidator, authController.login)
route.get('/profile', AuthMiddleware.verifyToken, authController.profile)

route.get('/send-email-verification', AuthMiddleware.verifyToken, authController.sendEmailVerification)
route.get('/verify-email/:token', authController.verifyemail)

route.post('/forgetPassword', authController.forgetPassword)
route.get('/verify-password-token/:token', authController.verifyPasswordToken)
route.patch('/change-password/:token', authController.changePassword)

route.post('/logout', authController.userLogout)



module.exports = route