const route = require('express').Router()

const AuthMiddleware = require('../middlewares/authMiddleware')
const AuthorizationMiddleware = require('../middlewares/authorizationMiddleware')

const apiValidator = require('./../middlewares/apiValidatorMiddleware')
const { createAdminValidation } = require('../validators/superAdminValidation')

const {superAdminController} = require('../container')

route.post('/create-admin', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("super_admin"), createAdminValidation, apiValidator, superAdminController.createAdmin)

module.exports = route