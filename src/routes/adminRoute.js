const route = require('express').Router()

const AuthMiddleware = require('../middlewares/authMiddleware')
const AuthorizationMiddleware = require('../middlewares/authorizationMiddleware')

const apiValidator = require('./../middlewares/apiValidatorMiddleware')
const { userIdValidation } = require('../validators/userApiValidation')

const {adminController} = require('../container')



route.get('/getallusers',AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("admin"), adminController.getAllUsers)


route.delete('/deleteuser/:userid',AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("admin"), userIdValidation, apiValidator, adminController.deleteUser) 

route.get('/getdeleteduser',AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("admin"), adminController.getDeletedUser)

module.exports = route