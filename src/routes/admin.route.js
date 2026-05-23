const route = require('express').Router()

const apiValidator = require('./../middlewares/apiValidator.middleware')

// const postModel = require('./../models/post.model')
// const commentsModel = require('./../models/comments.model')
// const userModel = require('./../models/user.model')
// const likeModel = require('./../models/postLike.model')


const AdminServices = require('./../services/admin.service')
const AdminController = require('./../controllers/admin.controller')

const AuthMiddleware = require('../middlewares/auth.middleware')
const RoleMiddleware = require('../middlewares/authorized.middleware')
const { userIdValidation } = require('../utils/validation/userApiValidation')

const adminService = new AdminServices()
const adminController = new AdminController(adminService)



route.get('/getallusers',AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("admin"), adminController.getAllUsers)


route.delete('/deleteuser/:userid',AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("admin"), userIdValidation, apiValidator, adminController.deleteUser) 


module.exports = route