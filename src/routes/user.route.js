const route = require('express').Router()

const apiValidator = require('./../middlewares/apiValidator.middleware')
const { commentsValidaion, getFeedsValidation, postIdValidation, userIdValidation
} = require('../utils/validation/userApiValidation')
const upload = require('../middlewares/multer.middleware')

const postModel = require('./../models/post.model')
const postVisited = require('./../models/postVisited.model')
const feedsVisited = require('./../models/visitedFeeds.model')
const commentsModel = require('./../models/comments.model')
const postLike = require("../models/postLike.model")
const userModel = require('./../models/user.model')
const userCategory = require('../models/userCategory.model')
const userFeedCategory = require('../models/userFeedsCategory.model')
const UserServices = require('./../services/user.service')
const UserController = require('./../controllers/user.controller')
const AuthMiddleware = require('../middlewares/auth.middleware')
const RoleMiddleware = require('../middlewares/authorized.middleware')

const userService = new UserServices(userModel, postModel, commentsModel, postLike, postVisited, feedsVisited, userCategory, userFeedCategory)
const userController = new UserController(userService)


route.post("/setcategory", AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.setCategory)

route.patch("/updatecategory", AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.updateCategory)


route.post('/createpost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), upload.fields([{name: "media_urls", maxCount: 5}]) , userController.createPost)

route.post('/makecomment/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), commentsValidaion, apiValidator, userController.makeComment)

route.post('/togglelike/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), postIdValidation, apiValidator, userController.togeLike)

route.get('/getAllMyPost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getAllMyPost)

route.get('/getsharedpost/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), postIdValidation, apiValidator, userController.getsharedpost)

route.get('/getallpostbyuserid/:userid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userIdValidation, apiValidator, userController.getAllPostByUserId)

route.get('/feeds', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), getFeedsValidation, apiValidator, userController.getFeeds)

route.post('/createcommunity', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), upload.fields([{name: "avatar", maxCount:1}, {name: "banner", maxCount:1}]), userController.createCommunity)

route.get('/joincommunity/:communityid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.joincommunity)
route.post('/acceptreqforjoincommunity', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.acceptReq)







module.exports = route