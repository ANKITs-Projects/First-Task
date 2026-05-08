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
    userCategory,
    userFeedCategory,
  ) {
    this.userModel = userModel;
    this.postModel = postModel;
    this.commentsModel = commentsModel;
    this.postLike = postLike;
    this.postVisited = postVisited;
    this.feedsVisited = feedsVisited;
    this.userCategory = userCategory;
    this.userFeedCategory = userFeedCategory;
  }

  async setCategory(data, userid) {
    try {
      const { category, subCategory } = data;
      const userCategory = await this.userCategory.findOne({ userId: userid });

      if (userCategory) throw createError("User's Category already exist");

      const res = await this.userCategory.create({
        category,
        subCategory,
      });

      await this.userFeedCategory.findOneAndUpdate(
        { userId: userid },
        {
          $push: {
            categories: {
              $each: [...category, ...subCategory],
            },
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      );

      return res;
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(data, userid) {
    try {
      const { category, subCategory } = data
      const res = await this.userCategory.findOneAndUpdate(
        { userId: userid },
        {
          $push: {
            categories: {
              $each: [...category, ...subCategory],
            },
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        },
      )

      await this.userFeedCategory.findOneAndUpdate(
        { userId: userid },
        {
          $set: {
            categories: $push(...category, ...subCategory),
          },
        },
        {
          new: true,
          upsert: true,
        },
      )

      return res
    } catch (error) {
      throw error
    }
  }

  async createPost(userId, data) {
    try {
      const { caption, mediaUrl, tags, postCategory } = data;

      if (Array.isArray(mediaUrl) && mediaUrl.length > 5)
        throw createError("You can upload at max 5 media", 400);

      const newPost = await this.postModel.create({
        caption,
        mediaUrl,
        userId,
        tags,
        postCategory,
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

      const comment = await this.commentsModel.find({ post: postId });

      const key = "secretkeyforpost";
      const encryptedPost = TokenGenerator.generateToke(
        { post: post, comment: comment },
        "1d",
        key,
      );

      await this.postVisited.create({
        userId: userId,
        postId: postId,
      });
      return { encryptedPost, key, post, comment };
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

        await this.postModel.findOneAndUpdate(
          { postid: postid },
          { $inc: { likes: 1 } },
        );

        await this.postVisited.create({
          userId: userId,
          postId: postid,
        });

        return "Post liked";
      }

      likePost.isliked = !likePost.isliked;

      await likePost.save();

      if (likePost.isliked) {
        await this.postModel.findOneAndUpdate(
          { postid: postid },
          { $inc: { likes: 1 } },
        );
        return "Post liked";
      }

      await this.postModel.findOneAndUpdate(
        { postid: postid },
        { $inc: { likes: -1 } },
      );
      return "Post unliked";
    } catch (error) {
      throw error;
    }
  }

  async getFeeds(userId) {
    try {
      const visited = await this.feedsVisited.findOne({ userId: userId });

      const category = await this.userFeedCategory
        .findOne({ userId: userid })
        .select("categories");

      let query = { _id: { $nin: [] }, postCategory: {$inc: []}}


      if (visited && visited.timeRange.length === 2) {
        const newestSeen = new Date(visited.timeRange[0]);
        const oldestSeen = new Date(visited.timeRange[1]);
        query.$or = [
          { createdAt: {$lt: oldestSeen }},
          { createdAt: {$gt: newestSeen }},
        ];
      }

      const category = await this.userFeedCategory.findOne({userId: userId}).select("categories")

      query.postCategory = category

      const postLimit = Number(process.env.POST_LIMIT) || 10;

      const visitedPosts = await this.postVisited.find({ userId: userId });
      const visitedPostIds = visitedPosts.map((item) => item.postId);
      query._id.$nin = visitedPostIds;

      this.extractCategory(category, userId);

      const feed = await this.postModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(postLimit);

      if (feed && feed.length > 0) {
        const startfeed = feed[0].createdAt;
        const endfeed = feed[feed.length - 1].createdAt;

        await this.feedsVisited.findOneAndUpdate(
          { userId: userId },
          { $set: { timeRange: [startfeed, endfeed] } },
          { upsert: true },
        );
      }

      return feed;
    } catch (error) {
      throw error;
    }
  }

  async extractCategory(userId) {
    const category = new Set();

    const visitedPost = await this.postVisited
      .find({ userId: userId })
      .select("postId");
    const likedPost = await this.postLike
      .find({ userId: userId })
      .select("postId");

    const posts = new Set([...visitedPost, ...likedPost]);

    for (const id of posts) {
      const postCategory = await this.postModel
        .findById(id)
        .select("postCategory");
      category.add(...postCategory);
    }
    return category;
  }
}

module.exports = UserServices;
