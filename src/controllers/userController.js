const apiResponce = require('../utils/apiResponse')

class UserController {
  
  constructor(userService) {
    this.userService = userService;
  }

  setCategory = async (req, res, next) => {
    try {
      const { category } = req.body
      const userId = req.userid

      const result = await this.userService.setCategory(category, userId);

      res.status(201).json(
        apiResponce(result ,"Category Set Successfully")
       );
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req, res, next) => {
    try {
      const result = await this.userService.updateCategory(
        req.body,
        req.userid,
      );

      res.status(201).json(
        apiResponce(result ,"Category updated Successfully")
      );
    } catch (error) {
      next(error);
    }
  };

  createPost = async (req, res, next) => {
    try {
      
      const media_urls = req.files ? Object.values(req.files).map(item => item.path) : [];

      const data = {
      ...req.body,
      media_urls,
    };

      const result = await this.userService.createPost(req.userid, data);

      res.status(201).json(
        apiResponce(result ,"Post Created Successfully"),
      );
    } catch (error) {
      next(error);
    }
  };
  updatePost = async(req, res, next) => {
    try {
      const {postid} = req.params
      const userId = req.userid
      const post = await this.userService.updatePost(req.body, postid, userId)

      res.status(200).json(
        apiResponce({post}, "Post update successfully...")
      )
    } catch (error) {
      next(error)
    }
  }

  publishDraftPost = async (req, res, next) => {
    try {
      const {postid} = req.params
      const userId = req.userid
      const post = await this.userService.publishDraftPost(postid, userId)

      res.status(200).json(
        apiResponce({post}, "Post Published successfully...")
      )
    } catch (error) {
      next(error)
    }
  }

  makeComment = async (req, res, next) => {
    try {
      const userid = req.userid;
      const { postid } = req.params;
      const { comment, parentCommentId } = req.body;
      const result = await this.userService.makeComment(userid, postid, parentCommentId, comment);

      res.status(201).json(
         apiResponce({result} ,"Comment Successfully"),
       );
    } catch (error) {
      next(error);
    }
  };

  getComment = async (req, res, next) => {
    try {
      const {postid} = req.params
      const comments = await this.userService.getComment(postid)

      const message = comments.length === 0 ? "No comments" : "Comments fetched successfully.."

      res.status(200).json(
        apiResponce({comments}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  toggleLike = async (req, res, next) => {
    try {
      const { postid } = req.params;
      const message = await this.userService.toggleLike(postid, req.userid);

      res.status(201).json(
        apiResponce(null , message)
      );
    } catch (error) {
      next(error);
    }
  };

  follow = async (req, res, next) => {
    try {
      const {followingId} = req.params
      const userId = req.userid
      const follow = await this.userService.follow(userId, followingId)

      res.status(201).json(
        apiResponce({follow}, "Following successfully...")
      )
    } catch (error) {
      next(error)
    }
  }

  getFollowers = async (req, res, next) => {
    try {
      const userId = req.userid
      const follower = await this.userService.getFollowers(userId)     
      
      const message = follower.length === 0 ? "No more followers" : "Follower fetched successfully.."

      res.status(200).json(
        apiResponce({follower}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  getFollowing = async (req, res, next) => {
    try {
      const userId = req.userid
      const following = await this.userService.getFollowing(userId)     
      
      const message = following.length === 0 ? "No more following" : "Following fetched successfully.."

      res.status(200).json(
        apiResponce({following}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  getAllMyPost = async (req, res, next) => {
    try {
      const { cursor } = req.query;
      const userid = req.userid
      const { post, newCursor } = await this.userService.getAllPostByUserId(userid, cursor);

      const message = post.length === 0 ? "There is no post" : "Post fetched successfully!!"

      res.status(200).json(
        apiResponce( { post, cursor: newCursor } , message)
      );
    } catch (error) {
      next(error);
    }
  };

  getDraftPost = async (req, res, next) => {
    try {
      const { cursor } = req.query;
      const { post, newCursor } = await this.userService.getDraftPost(req.userid, cursor);

      res.status(200).json(
        apiResponce( { post, cursor: newCursor } , "Post fetched successfully!!")
      );
    } catch (error) {
      next(error);
    }
  };

  getsharedpost = async (req, res, next) => {
    try {
      const { postid } = req.params;

      const post =
        await this.userService.getsharedpost(postid, req.userid);

      res.status(200).json(
        apiResponce( { post } , "Post fetched successfully!!")
      );
    } catch (error) {
      next(error);
    }
  };

  getAllPostByUserId = async (req, res, next) => {
    try {
      const { userid } = req.params;
      const { cursor } = req.query;
      const { post, newCursor } =  await this.userService.getAllPostByUserId(userid, cursor);
      const message = post.length === 0 ? "There is no post" : "Post fetched successfully!!"

      res.status(200).json(
        apiResponce( { post, cursor: newCursor } , message),
        );
    } catch (error) {
      next(error);
    }
  };

  createCommunity = async (req, res, next) => {
    try {
      const userId = req.userid

      const avatar = req.files?.avatar?.path || null;
      const banner = req.files?.banner?.path || null;

      const data = {
        ...req.body,
        avatar,
        banner
      };

      
      const community = await this.userService.createCommunity(data, userId)
      
      res.status(201).json(
        apiResponce({community}, "Community created successfully!!")
      )

    } catch (error) {
      next(error)
    }
  }

  getAllPostByCommunityId = async (req, res, next) => {
    try {
      const { communityid } = req.params;
      const { cursor } = req.query;
      const userId = req.userid
      const { posts, newCursor } = await this.userService.getAllPostByCommunityId(communityid, cursor, userId);

      const message = posts.length === 0 ? "No posts" : "Post fetched successfully!!"

      res.status(200).json(
        apiResponce( { posts, cursor: newCursor } , message),
      );
    } catch (error) {
      next(error)
    }
  }

  joincommunity = async (req, res, next) => {
    try {
      const {communityid} = req.params
      const userid = req.userid
      const {data, message} = await this.userService.joincommunity(communityid, userid)

      res.status(200).json(
        apiResponce(data, message)
      )
    } catch (error) {
      next(error)
    }
  }

  getNotification = async (req, res, next) => {
    try {
      const notification = await this.userService.getNotification(req.userid)
      const message = notification.length === 0 ? "There is no notification" : "Notification fetched successfully..."

      res.status(200).json(
        apiResponce({notification}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  acceptReqToJoinCommunity = async (req, res, next) => {
    try {
      const member = await this.userService.acceptReqToJoinCommunity(req.body, req.userid)

      res.status(200).json(
        apiResponce({member}, "Request approved..")
      )
    } catch (error) {
      next(error)
    }
  }

  reqToPostInCommunity = async (req, res, next) => {
    try {
      const {communityid} = req.params
      const userid = req.userid
      const {data, message} = await this.userService.reqToPostInCommunity(communityid, userid)

      res.status(200).json(
        apiResponce(data, message)
      )
    } catch (error) {
      next(error)
    }
  }

  acceptReqToPostInCommunity = async (req, res, next) => {
    try {
      const member = await this.userService.acceptReqToPostInCommunity(req.body, req.userid)

      res.status(200).json(
        apiResponce({member}, "Request approved to post in community")
      )
    } catch (error) {
      next(error)
    }
  }

  searchpost = async (req, res, next) => {
    try {
      const {query, cursor} = req.query
      const userId = req.userid
      const {posts, newCursor} = await this.userService.searchpost(query, cursor, userId)

      const message = posts.length === 0 && cursor ? "No more posts" : posts.length === 0 ? "No posts found according to query" : "Posts get successfully!!"

      res.status(200).json(
        apiResponce({posts: posts, cursor: newCursor}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  searchpostWithTag = async (req, res, next) => {
    try {
      const {query, cursor} = req.query
      const userId = req.userid
      const {posts, newCursor} = await this.userService.searchpostWithTag(query, cursor, userId)

      const message = posts.length === 0 && cursor ? "No more posts" : posts.length === 0 ? "No posts found according to query" : "Posts get successfully!!"

      res.status(200).json(
        apiResponce({posts, cursor: newCursor}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  searchProfile = async (req, res, next) => {
    try {
      const {query, cursor} = req.query
      const userId = req.userid
      const {profiles, newCursor} = await this.userService.searchProfile(query, cursor, userId)

      const message = profiles.length === 0 && cursor ? "No more profiles" : profiles.length === 0 ? "No profiles found according to query" : "profiles get successfully!!"

      res.status(200).json(
        apiResponce({profiles, cursor: newCursor}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  searchCommunity = async (req, res, next) => {
    try {
      const {query, cursor} = req.query
      const userId = req.userid
      const {communities, newCursor} = await this.userService.searchCommunity(query, cursor, userId)

      const message = communities.length === 0 && cursor ? "No more communities" : communities.length === 0 ? "No communities found according to query" : "communities get successfully!!"

      res.status(200).json(
        apiResponce({communities, cursor: newCursor}, message)
      )
    } catch (error) {
      next(error)
    }
  }

  getFeeds = async (req, res, next) => {
    try {
      const visitedfeedToken = req.cookies.visitedfeedToken;
      const { feed, token, removeToken } = await this.userService.getFeeds(
        req.userid,
        visitedfeedToken,
      )
      
      if(removeToken) {
        res.clearCookie("visitedfeedToken");
        res.status(200).json(
          apiResponce( {feed} , "Feeds fetched successfully!!"),  
        )
      return
      }
      
      res.cookie("visitedfeedToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 5 * 60 * 60 * 1000
      })
      res.status(200).json(
          apiResponce( {feed} , "Feeds fetched successfully!!"),
        )
    } catch (error) {
      next(error)
    }
  }
  
}

module.exports = UserController
