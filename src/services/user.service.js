const TokenGenerator = require("../utils/token.generator");
const createError = require("../utils/errorObjGenerater");

class UserServices {
  constructor(
    userModel,
    postModel,
    commentsModel,
    postLike,
    postVisited,
    feedsVisited,
  ) {
    this.userModel = userModel;
    this.postModel = postModel;
    this.commentsModel = commentsModel;
    this.postLike = postLike;
    this.postVisited = postVisited;
    this.feedsVisited = feedsVisited;
  }

  async createPost(userId, data) {
    try {
      const { text, mediaUrl } = data;

      if (Array.isArray(mediaUrl) && mediaUrl.length > 5)
        throw createError("You can upload at max 5 media", 400);

      const newPost = await this.postModel.create({
        text,
        mediaUrl,
        userId,
      });

      return newPost;
    } catch (error) {
      throw error;
    }
  }

  async getPost(postId, userId) {
    try {
      const post = await this.postModel.findById(postId);
      if (!post) throw createError("Post not found", 404);

      const likes = await this.postLike.find({ postid: postId, isliked: true });
      const comment = await this.commentsModel.find({ post: postId });

      const key = "secretkeyforpost";
      const encryptedPost = TokenGenerator.generateToke(
        { post: post, likes: likes.length, comment: comment },
        "1d",
        key,
      );

      await this.postVisited.create({
        userId: userId,
        postId: postId,
      });
      return { encryptedPost, key, post, likes, comment };
    } catch (error) {
      throw error;
    }
  }

  async getAllPost(userId, skip) {
    try {
      const postLimit = process.env.POST_LIMIT;
      const post = await this.postModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(postLimit);

      if (post.length === 0)
        throw createError("there is no post for this user", 404);

      const key = "secretkeyforpost";
      const encryptedPost = TokenGenerator.generateToke(
        { allPost: post },
        "1d",
        key,
      );

      return { encryptedPost, key, post };
    } catch (error) {
      throw error;
    }
  }

  async makeComment(userid, postid, comment) {
    try {
      const post = await this.postModel.findById(postid);

      if (!post) throw createError("Post is not found!!", 404);

      const newComment = await this.commentsModel.create({
        userId: userid,
        post: postid,
        comments: comment,
      });

      return newComment;
    } catch (error) {
      throw error;
    }
  }

  async togeLike(postid, userId) {
    try {
      const likePost = await this.postLike.findOne({ userId: userId });

      if (!likePost) {
        await this.postLike.create({
          userId: userId,
          postid: postid,
        });

        await this.postVisited.create({
          userId: userId,
          postId: postid,
        });

        return "Post liked";
      }

      likePost.isliked = !likePost.isliked;

      await likePost.save();

      return likePost.isliked ? "Post liked" : "Post unliked";
    } catch (error) {
      throw error;
    }
  }

  async getFeeds(userId) {
  try {
    const visited = await this.feedsVisited.findOne({ userId: userId })
    
    let query = { _id: { $nin: [] } }

    if (visited && visited.cursorRange.length === 2) {
      const newestSeen = new Date(visited.cursorRange[0])
      const oldestSeen = new Date(visited.cursorRange[1])
      query.$or = [
        { createdAt: { $lt: oldestSeen } },
        { createdAt: { $gt: newestSeen } }
      ];
    }

    const postLimit = Number(process.env.POST_LIMIT) || 10
    
    const visitedPosts = await this.postVisited.find({ userId: userId })
    const visitedPostIds = visitedPosts.map((item) => item.postId)
    query._id.$nin = visitedPostIds

    const feed = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(postLimit);

    if (feed && feed.length > 0) {
      const startfeed = feed[0].createdAt
      const endfeed = feed[feed.length - 1].createdAt

      await this.feedsVisited.findOneAndUpdate(
        { userId: userId },
        { $set: { cursorRange: [startfeed, endfeed] } },
        { upsert: true }
      );
    }

    return feed
  } catch (error) {
    throw error
  }
}
}

module.exports = UserServices;
