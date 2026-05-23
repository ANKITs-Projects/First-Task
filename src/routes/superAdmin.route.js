const route = require('express').Router()

// const userModel = require('../models/user.model')

const SuperAdminService = require('../services/superAdmin.service')
const SuperAdminController = require('../controllers/superAdmin.controller')
const AuthMiddleware = require('../middlewares/auth.middleware')
const RoleMiddleware = require('../middlewares/authorized.middleware')

const apiValidator = require('./../middlewares/apiValidator.middleware')
const { createAdminValidation } = require('../utils/validation/superAdminValidation')

const superAdminService = new SuperAdminService()
const superAdminController = new SuperAdminController(superAdminService)

route.post('/create-admin', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("super_admin"), createAdminValidation, apiValidator, superAdminController.createAdmin)

module.exports = route