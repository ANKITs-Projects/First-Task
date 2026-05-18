const apiResponce = require('./../utils/responceObj')

class UserController {
  
  constructor(userService) {
    this.userService = userService;
  }

  setCategory = async (req, res, next) => {
    try {
      const result = await this.userService.setCategory(req.body, req.userid);

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

      const mediaFiles = req.files?.media_urls || [];

      const media_urls = mediaFiles.map(
      (file) => file.path
      );

      const data = {
      ...req.body,
      media_urls,
    };

      const result = await this.userService.createPost(req.userid, data);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
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
      const { comment, parrnetCommentId } = req.body;
      const result = await this.userService.makeComment(userid, postid, parrnetCommentId, comment);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
      res.status(201).json(
         apiResponce(result ,"Comment Successfully"),
       );
    } catch (error) {
      next(error);
    }
  };

  getComment = async (req, res, next) => {
    try {
      const {postid} = req.params
      const {comments} = await this.userService.getComment(postid)

      res.status(200).json(
        apiResponce({comments}, "Comments fetched successfully..")
      )
    } catch (error) {
      next(error)
    }
  }

  togeLike = async (req, res, next) => {
    try {
      const { postid } = req.params;
      const message = await this.userService.togeLike(postid, req.userid);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
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
      
      res.status(200).json(
        apiResponce({follower}, "Follower fetched successfully..")
      )
    } catch (error) {
      next(error)
    }
  }

  getFollowing = async (req, res, next) => {
    try {
      const userId = req.userid
      const following = await this.userService.getFollowing(userId)     
      
      res.status(200).json(
        apiResponce({following}, "Following fetched successfully..")
      )
    } catch (error) {
      next(error)
    }
  }

  getAllMyPost = async (req, res, next) => {
    try {
      const { cursor } = req.query;
      const { post, newCursor } =
        await this.userService.getallMypost(req.userid, cursor);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
      res.status(200).json(
        apiResponce( { post, cursor: newCursor } , "Post fetched successfully!!")
      );
    } catch (error) {
      next(error);
    }
  };

  getDraftPost = async (req, res, next) => {
    try {
      const { cursor } = req.query;
      const { post, newCursor } = await this.userService.getDraftPost(req.userid, cursor);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
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

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
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
      const { post, newCursor } =
        await this.userService.getAllPostByUserId(userid, cursor);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
      res.status(200).json(
        apiResponce( { post, cursor: newCursor } , "Post fetched successfully!!"),
        );
    } catch (error) {
      next(error);
    }
  };

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
      
      res.cookie("visitedfeedToken", token)
      res.status(200).json(
          apiResponce( {feed} , "Feeds fetched successfully!!"),
        )
    } catch (error) {
      next(error)
    }
  }

  createCommunity = async (req, res, next) => {
    try {
      const userId = req.userid

      const avatar = req.files?.avatar?.[0]?.path || null;
      const banner = req.files?.banner?.[0]?.path || null;

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

  getAllPostByCommnityId = async (req, res, next) => {
    try {
      const { communityid } = req.params;
      const { cursor } = req.query;
      const userId = req.userid
      const { posts, newCursor } = await this.userService.getAllPostByCommnityId(communityid, cursor, userId);

      res.cookie("authToken", req.token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
      res.status(200).json(
        apiResponce( { posts, cursor: newCursor } , "Post fetched successfully!!"),
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

      res.status(200).json(
        apiResponce({posts, cursor: newCursor}, "Posts get successfully!!")
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

      res.status(200).json(
        apiResponce({posts, cursor: newCursor}, "Posts get successfully!!")
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

      res.status(200).json(
        apiResponce({profiles, cursor: newCursor}, "Profiles get successfully!!")
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

      res.status(200).json(
        apiResponce({communities, cursor: newCursor}, "Communities get successfully!!")
      )
    } catch (error) {
      next(error)
    }
  }
  
}

module.exports = UserController
