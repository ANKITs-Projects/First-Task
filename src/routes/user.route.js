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
route.get('/getcomments/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getComment)

route.post('/togglelike/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), postIdValidation, apiValidator, userController.togeLike)

route.post('/follow/:followingId', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.follow)

route.get('/getfollowers', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getFollowers)
route.get('/getfollowing', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getFollowing)

route.get('/getAllMyPost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getAllMyPost)
route.get('/getDraftPost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getDraftPost)
route.patch('/updatepost/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.updatePost)
route.patch('/publishdraftpost/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.publishDraftPost)

route.get('/getsharedpost/:postid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), postIdValidation, apiValidator, userController.getsharedpost)

route.get('/getallpostbyuserid/:userid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userIdValidation, apiValidator, userController.getAllPostByUserId)

route.post('/createcommunity', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), upload.fields([{name: "avatar", maxCount:1}, {name: "banner", maxCount:1}]), userController.createCommunity)

route.get('/getallpostbycommunityid/:communityid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.getAllPostByCommnityId)

route.get('/joincommunity/:communityid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.joincommunity)

route.post('/acceptreqforjoincommunity', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.acceptReqToJoinCommunity)

route.get('/reqtopostincommunity/:communityid', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.reqToPostInCommunity)

route.post('/acceptreqtopostincommunity', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.acceptReqToPostInCommunity)

route.get('/searchpost', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.searchpost)
route.get('/searchpostwithtag', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.searchpostWithTag)
route.get('/searchprofile', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.searchProfile)
route.get('/searchcommunity', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), userController.searchCommunity)

route.get('/feeds', AuthMiddleware.verifyToken, RoleMiddleware.authorizeRoles("user"), getFeedsValidation, apiValidator, userController.getFeeds)




module.exports = route