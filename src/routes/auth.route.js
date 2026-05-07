const route = require('express').Router()
const apiValidator = require('./../middlewares/apiValidator.middleware')
const {signupValidation, loginValidation} = require('../utils/validation/authValidation')

const userModel = require('../models/user.model')
const AuthServices = require('./../services/auth.service')
const AuthController = require('./../controllers/auth.controller')

const authService = new AuthServices(userModel)
const authController = new AuthController(authService)




route.post('/signup', signupValidation, apiValidator, authController.signup)
route.post('/login', loginValidation, apiValidator, authController.login)



module.exports = route