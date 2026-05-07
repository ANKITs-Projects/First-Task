const route = require('express').Router()

const apiValidator = require('./../middlewares/apiValidator.middleware')
const {createPostValidaion, commentsValidaion, getFeedsValidation, postIdValidation, userIdValidation
} = require('../utils/validation/userApiValidation')

const postModel = require('./../models/post.model')
const postVisited = require('./../models/postVisited.model')
const feedsVisited = require('./../models/visitedFeeds.model')
const commentsModel = require('./../models/comments.model')
const postLike = require("../models/postLike.model")
const userModel = require('./../models/user.model')
const UserServices = require('./../services/user.service')
const UserController = require('./../controllers/user.controller')
const AuthMiddleware = require('../middlewares/auth.middleware')
const RoleMiddleware = require('../middlewares/authorized.middleware')

const userService = new UserServices(userModel, postModel, commentsModel, postLike, postVisited, feedsVisited)
const userController = new UserController(userService)



route.get('/feeds', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), getFeedsValidation, apiValidator, userController.getFeeds)

route.post('/creapost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), createPostValidaion, apiValidator, userController.createPost)

route.get('/getallpost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), userController.getAllMyPost)

route.get('/getpostbyid/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), postIdValidation, apiValidator, userController.getPost)

route.get('/getpostbyuserid/:userid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), userIdValidation, apiValidator, userController.getAllPostByUserId)

route.post('/makecomment/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), commentsValidaion, apiValidator, userController.makeComment)

route.post('/togglelike/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("User"), postIdValidation, apiValidator, userController.togeLike)



module.exports = route