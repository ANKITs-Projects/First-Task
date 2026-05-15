const TokenGenerator = require("../utils/token.generator");
const createError = require("../utils/errorObjGenerater");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const postLikeModel = require("../models/postLike.model");
const pool = require("../config/pgdb");
const { create } = require("../models/post.model");

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
      const { category } = data;
      
      const userCategory = await pool.query(
        "SELECT * FROM users_category WHERE user_id = $1",
        [userid],
      );

      if (userCategory.rows.length > 0)
        throw createError("User's Category already exist", 400);

      const res = await pool.query(
        "INSERT INTO users_category (user_id, category) VALUES ($1, $2) RETURNING *",
        [userid, category],
      );

      await pool.query(
        "UPDATE users_feed_category SET category = ARRAY( SELECT DISTINCT unnest( COALESCE(feed_category, '{}') || $1::text[] )) WHERE user_id = $2 RETURNING *",
        [category, userid],
      );

      return res.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(data, userid) {
    try {
      const { category } = data;

      const result = await pool.query(
        `INSERT INTO users_category (user_id, category) 
            VALUES ($2, $1::TEXt[])
            
            ON CONFLICT (user_id)
            DO UPDATE SET category = ARRAY( 
            SELECT DISTINCT unnest( 
            COALESCE(users_category.category, '{}')
            || EXCLUDED.category
            )
          ) 
        RETURNING *`,
        [category, userid],
      );

      await pool.query(
        `INSERT INTO users_feed_category (user_id, feed_category)
          VALUES ($2, $1::text[])
   
          ON CONFLICT (user_id)
          DO UPDATE SET feed_category = ARRAY(
              SELECT DISTINCT unnest(
                COALESCE(users_feed_category.feed_category, '{}')
                || EXCLUDED.feed_category
              )
          )
          
          RETURNING *
        `,
        [category, userid],
      );

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async createPost(userId, data) {
    try {
      let {
        community_id,
        title,
        content,
        tags,
        media_urls,
        post_type,
        post_category,
      } = data;

      community_id = community_id ? community_id : null;

      if(community_id){
        const member = await pool.query(
          `
          SELECT * FROM community_members
          WHERE user_id = $1 AND community_id = $2 
          `,
          [userId, community_id]
        )
        if(!member.rows.length)
          throw createError("You are not the member of this community", 400)

        if(member.rows[0].can_post)
          throw createError("You are not allowed to post in this community", 400)
      }

      if (typeof post_category === "string") {
        post_category = JSON.parse(post_category);
      }

      if (typeof tags === "string") {
        tags = JSON.parse(tags);
      }

      media_urls = await Promise.all(
        media_urls.map(async (ele) => {
          return await uploadOnCloudinary(ele);
        }),
      );

      
      const newPost = await pool.query(
        `
        INSERT INTO posts (user_id, community_id, title, content, tags, media_urls, post_type, post_category)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id
          `,
        [
          userId,
          community_id,
          title,
          content,
          tags,
          media_urls,
          post_type,
          post_category,
        ],
      );

      return newPost.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async makeComment(userid, postid, parentCommentId, comment) {
    try {
     
      const post = await pool.query(
        `SELECT post_category FROM posts 
          WHERE id = $1
        `,
        [postid],
      );

      if (!post.rows.length) throw createError("Post is not found!!", 404);

      const newComment = await pool.query(
        `
        INSERT INTO comments (post_id, user_id, parent_comment_id, comment)
        VALUES($1, $2, $3, $4)
        RETURNING id
        `,
        [postid, userid, parentCommentId, comment],
      );

      await pool.query(
        `
        UPDATE posts SET comments_count = comments_count + 1
        WHERE id = $1
        `,
        [postid],
      );

      const category = post.rows[0].post_category;
      await pool.query(
        `INSERT INTO users_feed_category (user_id, feed_category)
          VALUES ($2, $1::text[])
   
          ON CONFLICT (user_id)
          DO UPDATE SET feed_category = ARRAY(
              SELECT DISTINCT unnest(
                COALESCE(users_feed_category.feed_category, '{}')
                || EXCLUDED.feed_category
              )
          )
        `,
        [category, userid],
      );

      await pool.query(
        `INSERT INTO post_visited_by_user (user_id, post_id)
          VALUES ($2, $1)
   
          ON CONFLICT (user_id, post_id)
          DO NOTHING
        `,
        [postid, userid],
      );

      return newComment.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async togeLike(postid, userId) {
    try {
     
      const isPostliked = await pool.query(
        `
        INSERT INTO likes (user_id, post_id)
        VALUES ($1, $2)

        ON CONFLICT (user_id, post_id)
        DO UPDATE SET isliked = NOT likes.isliked

        RETURNING isliked
        `,
        [userId, postid],
      );

      const isliked = isPostliked.rows[0].isliked;

      const post = await pool.query(
        `
        UPDATE posts
        SET likes_count = likes_count ${isliked ? "+ 1" : "- 1"}
        WHERE id = $1
        RETURNING post_category
        `,
        [postid],
      );

      const category = post.rows[0].post_category;
      await pool.query(
        `INSERT INTO users_feed_category (user_id, feed_category)
          VALUES ($2, $1::text[])
   
          ON CONFLICT (user_id)
          DO UPDATE SET feed_category = ARRAY(
              SELECT DISTINCT unnest(
                COALESCE(users_feed_category.feed_category, '{}')
                || EXCLUDED.feed_category
              )
          )
        `,
        [category, userId],
      );

      await pool.query(
        `INSERT INTO post_visited_by_user (user_id, post_id)
          VALUES ($2, $1)
   
          ON CONFLICT (user_id, post_id)
          DO NOTHING
        `,
        [postid, userId],
      );

      return isliked ? "Post liked" : "Post unliked";
    } catch (error) {
      throw error;
    }
  }

  async getallMypost(userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const query = cursor
        ? ` WHERE user_id = '${userId}' AND id < '${cursor}'`
        : `WHERE user_id = '${userId}'`;

      const posts = await pool.query(
        `SELECT * FROM posts ${query}
          ORDER BY created_at DESC
          LIMIT ${postLimit}
          `,
      );

      if (posts.rows.length === 0) {
        const mes = cursor ? "No More Posts" : "There is no posts";
        throw createError(mes, 200);
      }

      return {
        post: posts.rows,
        newCursor: posts.rows[posts.rows.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async getsharedpost(postId, userId) {
    try {
      const post = await pool.query(`SELECT * FROM posts WHERE id=$1`, [
        postId,
      ]);

      if (!post.rows.length) 
        throw createError("Post not found", 404);

      if(post.rows[0].community_id) {
        const community_id = post.rows[0].community_id

        const community = await pool.query(
          `
          SELECT privacy FROM communities
          WHERE id = $1
          `,
          [community_id]
        ) 
        if(community.rows[0].privacy === "private"){
          const isMember = await pool.query(
            `
            SELECT * FROM community_members
            WHERE user_id = $1 AND community_id = $2
            `,
          [userId, community_id]
          )
          if(isMember.rows.length == 0)
            throw createError("You can not see this post you are not the member of the community", 400)
        }      
      }

      await pool.query(
        `
        UPDATE posts SET share_count = share_count + 1 WHERE id = $1
        `,
        [postId],
      );

      const category = post.rows[0].post_category;
      await pool.query(
        `INSERT INTO users_feed_category (user_id, feed_category)
          VALUES ($2, $1::text[])
   
          ON CONFLICT (user_id)
          DO UPDATE SET feed_category = ARRAY(
              SELECT DISTINCT unnest(
                COALESCE(users_feed_category.feed_category, '{}')
                || EXCLUDED.feed_category
              )
          )
        `,
        [category, userId],
      );

      await pool.query(
        `INSERT INTO post_visited_by_user (user_id, post_id)
          VALUES ($2, $1)
   
          ON CONFLICT (user_id, post_id)
          DO NOTHING
        `,
        [postId, userId],
      );

      return post.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllPostByUserId(userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const query = cursor
        ? ` WHERE user_id = '${userId}' AND id < '${cursor}'`
        : `WHERE user_id = '${userId}'`;

      const posts = await pool.query(
        `SELECT * FROM posts ${query}
          ORDER BY created_at DESC
          LIMIT ${postLimit}
          `,
      );

      if (posts.rows.length === 0) {
        const mes = cursor ? "No More Posts" : "There is no posts";
        throw createError(mes, 200);
      }

      return {
        post: posts.rows,
        newCursor: posts.rows[posts.rows.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async createCommunity(data, userId) {
    try {
      const { community_name, description, category, avatar, banner, privacy } =
        data;

      const avatar_url = avatar ? await uploadOnCloudinary(avatar) : null;
      const banner_url = banner ? await uploadOnCloudinary(banner) : null;

      const community = await pool.query(
        `
        INSERT INTO communities (community_name, description, category, avatar_url, banner_url, owner_id, privacy)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          community_name,
          description,
          category,
          avatar_url,
          banner_url,
          userId,
          privacy,
        ],
      );
      const community_id = community.rows[0].id;
      await pool.query(
        `
        INSERT INTO community_members (user_id, community_id, role)
        VALUES ($1,$2,$3)
        `,
        [userId, community_id, "admin"],
      );

      return community.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async joincommunity(communityid, userid) {
    try {
      const community = await pool.query(
        `
        SELECT * FROM communities 
        WHERE id=$1
        `,
        [communityid],
      );

      if (community.rows.length == 0)
        throw createError("Community not exist..", 400);

      const isMember = await pool.query(
        `
          SELECT * FROM community_members
          WHERE user_id = $1 AND community_id = $2
          `,
        [userid, communityid],
      );

      if (isMember.rows.length)
        throw createError("You are already a member..", 400);

      const { privacy } = community.rows[0];
      let member;

      if (privacy === "public" || privacy == "restricted") {
        const can_post = privacy === "public";
        member = await pool.query(
          `
          INSERT INTO community_members(user_id, community_id, can_post)
          VALUES ($1, $2, $3)
          RETURNING *
          `,
          [userid, communityid, can_post],
        );
      } 
      else {
        const admin = await pool.query(
          `
          SELECT user_id
          FROM community_members
          WHERE community_id = $1 AND role = $2
          `,
          [communityid, 'admin'],
        );

        const { community_name, id } = community.rows[0];

        const message = `
          UserId:- ${userid}
          Requesting to join the community:- ${community_name}
          CommunityId:- ${id}
          `;

        const values = [];
        const placeholders = admin.rows.map((ele, index) => {
            const base = index * 3;

            values.push(ele.user_id, message, userid);

            return `($${base + 1}, $${base + 2}, $${base + 3})`;
          }).join(", ");

        const notify = await pool.query(
          `
          INSERT INTO notification (receiver_id, message, sender_id)
          VALUES ${placeholders}
          RETURNING *;
          `,
          values,
        );

        return { data: notify.rows[0], message: "Request to join" };
      }

      await pool.query(
        `
          UPDATE communities SET member_count = member_count + 1
          WHERE id=$1
          `,
        [communityid],
      );

      return {
        data: member.rows[0],
        message: `You are joined to ${community.rows[0].community_name} community`,
      };
    } catch (error) {
      throw error;
    }
  }

  async acceptReq(data, userId) {
    try {
      const { communityId, requesterId } = data;
      const community = await pool.query(
        `
        SELECT * FROM communities 
        WHERE id = $1
        `,
        [communityId],
      );

      if (community.rows.length === 0)
        throw createError("Community not founde", 404);

      const admin = await pool.query(
        `
        SELECT role FROM community_members 
        WHERE user_id = $1 AND community_id = $2
        `,
        [userId, communityId],
      );

      if (admin.rows.length == 0)
        throw createError("You are not member of the community", 400);

      if (admin.rows[0].role != "admin")
        throw createError("You are not admin", 403);

      const isAlreadyMember = await pool.query(
        `
        SELECT * FROM community_members 
        WHERE user_id = $1 AND community_id = $2
        `,
        [requesterId, communityId],
      )
      if(isAlreadyMember.rows.length)
        throw createError("He is already a member of this community..", 400)

      const member = await pool.query(
        `
        INSERT INTO community_members(user_id, community_id, can_post)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [requesterId, communityId, false],
      );

      await pool.query(
        `
        UPDATE communities 
        SET member_count = member_count + 1
        WHERE id = $1
        `,
        [communityId],
      );

      // send notification to requester
      const { community_name, id } = community.rows[0];
      const message = `
        You have joined the community:- ${community_name}
        CommunityId:- community Id: ${id}
        `;

      await pool.query(
        `
        INSERT INTO notification (receiver_id, message, sender_id)
        VALUES ($1, $2, $3)
        `,
        [requesterId, message, userId],
      );

      return  member.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getFeeds(userId, visitedfeedToken) {
    try {
      const postLimit = Number(process.env.POST_LIMIT) || 10;

      let visitedFeedIds = [];

      if (visitedfeedToken) {
        visitedFeedIds = TokenGenerator.decodeToken(
          visitedfeedToken,
          process.env.VISITED_FEED_TOKEN,
        ).feedIds;
      }

      
      const visitedPosts = await pool.query(
        `
        SELECT post_id FROM post_visited_by_user 
        WHERE user_id = $1
        `,
        [userId],
      );

      if (visitedPosts.rows.length > 0) {
        const visitedPostIds = visitedPosts.rows.map((item) => item.post_id);
        visitedFeedIds.push(...visitedPostIds);
      }

      
      const category = await pool.query(
        `
        SELECT feed_category FROM users_feed_category
        WHERE user_id = $1
        `,
        [userId],
      );

      const feed_category = category.rows[0].feed_category;

      const query = `
        WHERE id <> ALL($1)
        AND
        post_category && $2
      `;

      
      let feed = await pool.query(
        `SELECT * FROM posts ${query}
          ORDER BY created_at DESC
          LIMIT ${postLimit}
          `,
        [visitedFeedIds, feed_category],
      );

      let removeToken = false;

      if (feed.rows.length == 0) {
        removeToken = true;

        feed = await pool.query(
          `
          SELECT * FROM posts
          ORDER BY created_at DESC, likes_count DESC
          LIMIT ${postLimit}
          `,
        );
      }

      const feedIds = feed.rows.map((ele) => ele.id);

      feedIds.push(...visitedFeedIds);

      const token = TokenGenerator.generateToke(
        { feedIds: feedIds },
        Number(process.env.VISITED_FEED_TOKEN_EXPIRESIN),
        process.env.VISITED_FEED_TOKEN,
      );

      return { feed: feed.rows, token, removeToken };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserServices;
