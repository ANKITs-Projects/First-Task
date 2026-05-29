const route = require('express').Router()

const apiValidator = require('./../middlewares/apiValidatorMiddleware')
const { commentsValidation, getFeedsValidation, postIdValidation, userIdValidation
} = require('../validators/userApiValidation')

const AuthMiddleware = require('../middlewares/authMiddleware')
const AuthorizationMiddleware = require('../middlewares/authorizationMiddleware')

const { userController } = require('../container')


route.post("/setcategory", AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.setCategory)

route.patch("/updatecategory", AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.updateCategory)


route.post('/createpost', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.createPost)

route.post('/makecomment/:postid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), commentsValidation, apiValidator, userController.makeComment)
route.get('/getcomments/:postid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getComment)

route.post('/togglelike/:postid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), postIdValidation, apiValidator, userController.toggleLike)

route.post('/follow/:followingId', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.follow)

route.get('/getfollowers', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getFollowers)
route.get('/getfollowing', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getFollowing)

route.get('/getallmyposts', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getAllMyPosts)
route.get('/getDraftPost', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getDraftPost)
route.patch('/updatepost/:postid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.updatePost)
route.patch('/publishdraftpost/:postid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.publishDraftPost)

route.get('/getsharedpost/:postid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), postIdValidation, apiValidator, userController.getsharedpost)

route.get('/getallpostbyuserid/:userid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userIdValidation, apiValidator, userController.getAllPostByUserId)


route.post('/createcommunity', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.createCommunity)

route.get('/getallpostbycommunityid/:communityid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getAllPostByCommunityId)

route.get('/joincommunity/:communityid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.joincommunity)

route.get('/getnotification', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.getNotification)

route.post('/acceptreqforjoincommunity', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.acceptReqToJoinCommunity)

route.get('/reqtopostincommunity/:communityid', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.reqToPostInCommunity)

route.post('/acceptreqtopostincommunity', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.acceptReqToPostInCommunity)

route.get('/searchpost', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.searchpost)
route.get('/searchpostwithtag', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.searchpostWithTag)
route.get('/searchprofile', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.searchProfile)
route.get('/searchcommunity', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), userController.searchCommunity)

route.get('/feeds', AuthMiddleware.verifyToken, AuthorizationMiddleware.authorizeRoles("user"), getFeedsValidation, apiValidator, userController.getFeeds)




module.exports = route