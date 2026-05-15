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

  acceptReq = async (req, res, next) => {
    try {
      const member = await this.userService.acceptReq(req.body, req.userid)

      res.status(200).json(
        apiResponce({member}, "Request approved..")
      )
    } catch (error) {
      next(error)
    }
  }

  
}

module.exports = UserController
