

class UserController {
    constructor(userService){
        this.userService = userService
    }

   
    createPost = async (req, res, next) => {
        try {
            const data = await this.userService.createPost(req.userid, req.body)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(201).json({
                success: true,
                message: "Post Created successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }
    
    getAllMyPost = async (req, res, next) => {
        try {
            
            const {encryptedPost, key, post} = await this.userService.getAllPost(req.userid)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(201).json({
                success: true,
                message: "All Post fetched successfully",
                key,
                encryptedPost,
                post
            })
        } catch (error) {
            next(error)
        }
    }

    getAllPostByUserId = async (req, res, next) => {
        try {
            
            const {userid} = req.params
            const {encryptedPost, key, post} = await this.userService.getAllPost(userid)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(201).json({
                success: true,
                message: "Post fetched successfully",
                key,
                encryptedPost,
                post
            })
        } catch (error) {
            next(error)
        }
    }
    
    getPost = async (req, res, next) => {
        try {
            const {postid} = req.params
            const {encryptedPost, key, post, likes, comment} = await this.userService.getPost(postid, req.userid)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(201).json({
                success: true,
                message: "All Post fetched successfully",
                key,
                encryptedPost,
                post,
                likes: likes.length,
                comment
            })
        } catch (error) {
            next(error)
        }
    }

    makeComment = async (req, res, next) => {
        try {
            const userid = req.userid
            const {postid} = req.params
            const { comment } = req.body
            const data = await this.userService.makeComment(userid, postid, comment)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(201).json({
                success: true,
                message: "Comment successfully",
                data
            })
        } catch (error) {
            next(error)
        }
    }

    togeLike = async (req, res, next) => {
        try {
            const {postid} = req.params
            const message = await this.userService.togeLike(postid, req.userid)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(201).json({
                success: true,
                message,
                token: req.token
            })
        } catch (error) {
            next(error)
        }
    }

    getFeeds = async (req, res, next) => {
        try { 
            const feeds = await this.userService.getFeeds(req.userid) 

            if(feeds.length == 0) {
                res.status(204).json({
                success: true,
                message: "No more feeds are available"
            })
            return
            }

            res.status(200).json({
                success: true,
                message: "Feeds fetched successfully!!",
                feeds
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UserController