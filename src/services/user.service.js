const TokenGenerator = require("../utils/token.generator");
const createError = require("../utils/errorObjGenerater");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const pool = require("../config/pgdb");

class UserServices {
  constructor(){}

  async updateUsersFeedCategory(category, userid) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async updateUsersVisitedFeed(postid, userid) {
    try {
      await pool.query(
        `INSERT INTO post_visited_by_user (user_id, post_id)
          VALUES ($1, $2)
   
          ON CONFLICT (user_id, post_id)
          DO NOTHING
        `,
        [userid, postid],
      );
    } catch (error) {
      throw error;
    }
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

      await this.updateUsersFeedCategory(category, userid);

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

      await this.updateUsersFeedCategory(category, userid);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async createPost(userId, data) {
    try {
      let {
        community_id = null,
        title,
        content,
        tags,
        media_urls,
        post_type,
        post_category,
        status= 'publish'
      } = data;


      if (community_id) {
        const community = await pool.query(
          `
          SELECT id FROM communities 
          WHERE id = $1
          `,
          [community_id],
        );
        if (community.rows.length === 0)
          throw createError("Community not exist..", 400);

        const member = await pool.query(
          `
          SELECT * FROM community_members
          WHERE user_id = $1 AND community_id = $2 
          `,
          [userId, community_id],
        );
        if (!member.rows.length)
          throw createError("You are not the member of this community", 400);

        if (!member.rows[0].can_post)
          throw createError(
            "You are not allowed to post in this community",
            400,
          );
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
        INSERT INTO posts (user_id, community_id, title, content, tags, media_urls, post_type, post_category, status)
          VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
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
          status
        ],
      );

      await this.updateUsersFeedCategory(post_category, userId);

      return newPost.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async updatePost(data, postId, userId) {
    try {

      const postData = await pool.query(
        `
        SELECT title, content, tags, post_category
        FROM posts
        WHERE 
        id = $1
        AND 
        user_id = $2
        `,
        [postId, userId]
      )

      if(postData.rows.length === 0)
        throw createError('Post not found', 400)


      const oldData = post.rows[0]

      let { title = oldData.title,
         content= oldData.content,
          tags = oldData.tags, 
          post_category = oldData.post_category,} = data;

      const post = await pool.query(
        `
        UPDATE INTO posts 
        SET (title, content, tags, post_category)
        VALUES ($1, $2, $3, $4)
        `,
        [title, content, tags, post_category]
      )

      return post.rows[0]
    } catch (error) {
      throw error
    }
  }

  async publishDraftPost(postId, userId) {
    try {
      const postData = await pool.query(
        `
        SELECT status
        FROM posts
        WHERE 
        id = $1
        AND 
        user_id = $2
        `,
        [postId, userId]
      )

      if(postData.rows.length === 0)
        throw createError('Post not found', 400)

      if(postData.rows[0].status == 'publish')
        throw createError('Post already published', 400)

      const post = await pool.query(
        `
        UPDATE posts
        SET status = $3
         WHERE 
        id = $1
        AND 
        user_id = $2
        RETURNING *
        `,
        [postId, userId, 'publish']
      )
      return post.rows[0]
    } catch (error) {
      throw error
    }
  }

  async makeComment(userid, postid, parentCommentId, comment) {
    try {
      const post = await pool.query(
        `
        SELECT post_category, status FROM posts 
        WHERE id = $1 
        AND status = 'publish'
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
      await this.updateUsersFeedCategory(category, userid);

      await this.updateUsersVisitedFeed(postid, userid);

      return newComment.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getComment(postId) {
    try {


      const post = await pool.query(
        `
        SELECT post_category FROM posts 
          WHERE id = $1
        AND status = 'publish'
        `,
        [postId]
      )
      if(post.rows.length == 0)
        throw createError("Post not exist", 400)


      const comments = await pool.query(
        `
        WITH RECURSIVE comment_tree AS (

        SELECT
            id,
            post_id,
            user_id,
            parent_comment_id,
            comment,
            created_at,
            0 AS depth,
            ARRAY[id] AS path
        FROM comments
        WHERE
        parent_comment_id IS NULL
          AND post_id = $1

        UNION ALL

              SELECT
                  c.id,
                  c.post_id,
                  c.user_id,
                  c.parent_comment_id,
                  c.comment,
                  c.created_at,
                  ct.depth + 1,
                  ct.path || c.id
              FROM comments c
              JOIN comment_tree ct
                  ON c.parent_comment_id = ct.id
          )

          SELECT
              id,
              user_id,
              parent_comment_id,
              comment,
              created_at,
              depth,
              path
          FROM comment_tree
          ORDER BY path;
        `,
        [postId]
      );

      if(comments.rows.length === 0)
        throw createError("No comments", 400)

      return {comments: comments.rows}
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
      await this.updateUsersFeedCategory(category, userId);

      await this.updateUsersVisitedFeed(postid, userId);

      return isliked ? "Post liked" : "Post unliked";
    } catch (error) {
      throw error;
    }
  }

  async follow(userId, followingId) {
    try {
      const user = await pool.query(
        `
        SELECT id FROM users
        WHERE id = $1
        `,
        [followingId]
      )
      if(user.rows.length === 0)
        throw createError("User not exist..", 400)

      const follow = await pool.query(
        `
        INSERT INTO followers (following, follower)
        VALUES ($1, $2)
        ON CONFLICT (following, follower)
        
        DO UPDATE SET isfollowing = NOT followers.isfollowing
        RETURNING isfollowing 
        `,
        [followingId, userId]
      )

      const isfollow = follow.rows[0].isfollowing

      await pool.query(
        `
        UPDATE users
        SET followers_count = followers_count ${isfollow ? "+ 1" : "- 1"}
        WHERE id = $1
        `,
        [followingId]
      )

      await pool.query(
        `
        UPDATE users
        SET following_count = following_count ${isfollow ? "+ 1" : "- 1"}
        WHERE id = $1
        `,
        [userId]
      )

      return follow.rows[0]

    } catch (error) {
      throw error
    }
  }

  async getFollowers(userId) {
    try {
      const follower = await pool.query(
        `
        SELECT * FROM followers
        WHERE following = $1 
        AND isfollowing = $2
        `,
        [userId, true]
      )

      if(follower.rows.length == 0)
        throw createError("No followers", 400)

      return follower.rows
    } catch (error) {
      throw error
    }
  }

  async getFollowing(userId) {
    try {
      const follower = await pool.query(
        `
        SELECT * FROM followers
        WHERE follower = $1 
        AND isfollowing = $2
        `,
        [userId, true]
      )

      if(follower.rows.length == 0)
        throw createError("No followings", 400)

      return follower.rows
    } catch (error) {
      throw error
    }
  }

  async getallMypost(userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const query = cursor ? `id < '${cursor}' AND` :  ``;
      
      const posts = await pool.query(
        `SELECT * FROM posts 
          WHERE 
          ${query}
          user_id = $1
          AND STATUS = $2
          ORDER BY created_at DESC
          LIMIT $3
        `,
        [userId, 'publish', postLimit]
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

  async getDraftPost (userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const query = cursor ? `user_id = 'id < '${cursor}' AND` :  ``;

      const posts = await pool.query(
        `SELECT * FROM posts 
          WHERE 
          ${query}
          user_id = $1
          AND STATUS = $2
          ORDER BY created_at DESC
          LIMIT $3
        `,
        [userId, 'draft', postLimit]
      );

      if (posts.rows.length === 0) {
        const mes = cursor ? "No More Draft Posts" : "There is no draft posts";
        throw createError(mes, 200);
      }

      return {
        post: posts.rows,
        newCursor: posts.rows[posts.rows.length - 1].id,
      };
    } catch (error) {
      throw error
    }
  }

  async getsharedpost(postId, userId) {
    try {
      const post = await pool.query(
        `
        SELECT * FROM posts 
        WHERE id=$1
        AND status = $2
        `, 
        
        [ postId, 'publish' ]
      );

      if (!post.rows.length) throw createError("Post not found", 404);

      if (post.rows[0].community_id) {
        const community_id = post.rows[0].community_id;

        const community = await pool.query(
          `
          SELECT privacy FROM communities
          WHERE id = $1
          `,
          [community_id],
        );
        if (community.rows[0].privacy === "private") {
          const isMember = await pool.query(
            `
            SELECT * FROM community_members
            WHERE user_id = $1 AND community_id = $2
            `,
            [userId, community_id],
          );
          if (isMember.rows.length == 0)
            throw createError(
              "You can not see this post you are not the member of the community",
              400,
            );
        }
      }

      await pool.query(
        `
        UPDATE posts SET share_count = share_count + 1 WHERE id = $1
        `,
        [postId],
      );

      const category = post.rows[0].post_category;
      await this.updateUsersFeedCategory(category, userId);

      await this.updateUsersVisitedFeed(postId, userId);

      return post.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllPostByUserId(userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const query = cursor ? `id < '${cursor}' AND` :  ``;

      const posts = await pool.query(
        `SELECT * FROM posts 
          WHERE 
          ${query}
          user_id = $1
          AND STATUS = $2
          ORDER BY created_at DESC
          LIMIT $3
        `,
        [userId, 'publish', postLimit]
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

      const communityExist = await pool.query(
        `
        SELECT * FROM communities
        WHERE community_name = $1
        `,
        [community_name]
      )

      if(communityExist.rows.length) {
        throw createError("Community with same name already exist..", 400)
      }

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

  async getAllPostByCommnityId(communityid, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const query = cursor ? `id < '${cursor}' AND` : ``;

      const community = await pool.query(
        `
        SELECT privacy FROM communities
        WHERE id = $1
        `,
        [communityid],
      );

      if (community.rows.length === 0)
        throw createError("Community not exist..", 400);

      if (community.rows[0].privacy === "private") {
        const member = await pool.query(
          `
          SELECT * FROM community_members
          WHERE user_id = $1 AND community_id = $2
          `,
          [userId, communityid],
        );
        if (member.rows.length === 0)
          throw createError(
            "This is a privet community and you are not the member of this community",
            401,
          );
      }

      const posts = await pool.query(
        `SELECT * FROM posts
         WHERE 
         ${query}
         status = $2
         AND
         community_id = $1
          ORDER BY created_at DESC
          LIMIT $3
          `,
        [communityid, 'publish' ,postLimit]
      );

      if (posts.rows.length === 0) {
        const mes = cursor ? "No More Posts" : "There is no posts";
        throw createError(mes, 200);
      }

      return {
        posts: posts.rows,
        newCursor: posts.rows[posts.rows.length - 1].id,
      };
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
      } else {
        const admin = await pool.query(
          `
          SELECT user_id
          FROM community_members
          WHERE community_id = $1 AND role = $2
          `,
          [communityid, "admin"],
        );

        const { community_name, id } = community.rows[0];

        const message = `
          UserId:- ${userid}
          Requesting to join the community:- ${community_name}
          CommunityId:- ${id}
          `;

        const values = [];
        const placeholders = admin.rows
          .map((ele, index) => {
            const base = index * 3;

            values.push(ele.user_id, message, userid);

            return `($${base + 1}, $${base + 2}, $${base + 3})`;
          })
          .join(", ");

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

  async notification(userId) {
    try {
      const notification = await pool.query(
        `
        SELECT * FROM notification
        WHERE receiver_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
      )

      if(notification.rows.length == 0)
        throw createError("There is no notification..", 200)

      return notification.rows

    } catch (error) {
      throw error
    }
  }

  async reqToPostInCommunity(communityid, userid) {
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

      if (!isMember.rows.length) throw createError("You are not member..", 400);

      if (isMember.rows[0].can_post)
        throw createError("You already can post", 400);

      const admin = await pool.query(
        `
        SELECT user_id
        FROM community_members
        WHERE community_id = $1 AND role = $2
        `,
        [communityid, "admin"],
      );

      const { community_name, id } = community.rows[0];

      const message = `
        UserId:- ${userid}
        Requesting to make post in the community:- ${community_name}
        CommunityId:- ${id}
        `;

      const values = [];
      const placeholders = admin.rows
        .map((ele, index) => {
          const base = index * 3;

          values.push(ele.user_id, message, userid);

          return `($${base + 1}, $${base + 2}, $${base + 3})`;
        })
        .join(", ");

      const notify = await pool.query(
        `
        INSERT INTO notification (receiver_id, message, sender_id)
        VALUES ${placeholders}
        RETURNING *;
        `,
        values,
      );

      return {
        data: notify.rows[0],
        message: "Notification send successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async acceptReqToJoinCommunity(data, userId) {
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
      );
      if (isAlreadyMember.rows.length)
        throw createError("He is already a member of this community..", 400);

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

      return member.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async acceptReqToPostInCommunity(data, userId) {
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

      const isAlreadyCanPost = await pool.query(
        `
        SELECT * FROM community_members 
        WHERE user_id = $1 AND community_id = $2
        `,
        [requesterId, communityId],
      );
      if (isAlreadyCanPost.rows.length === 0)
        throw createError("He is not member of this community..", 400);

      if (isAlreadyCanPost.rows[0].can_post)
        throw createError("He is already can post...", 400);

      const member = await pool.query(
        `
        UPDATE community_members SET can_post = $3
        WHERE user_id = $1 AND community_id = $2
        RETURNING *
        `,
        [requesterId, communityId, true],
      );

      // send notification to requester
      const { community_name, id } = community.rows[0];
      const message = `
        You can post now in this community:- ${community_name}
        CommunityId:- community Id: ${id}
        `;

      await pool.query(
        `
        INSERT INTO notification (receiver_id, message, sender_id)
        VALUES ($1, $2, $3)
        `,
        [requesterId, message, userId],
      );

      return member.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async searchpost(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;
      const q = cursor ? `p.id < '${cursor}' AND` : "";

      const post = await pool.query(
        `
        SELECT
        p.*,
        c.community_name
        FROM posts p
        LEFT JOIN communities c
            ON p.community_id = c.id
        WHERE
            ${q}
            status = $2
            AND
            (
                p.community_id IS NULL
                OR c.privacy != 'private'
            )
            AND (
                p.title ILIKE '%' || $1 || '%'
                OR p.content ILIKE '%' || $1 || '%'
                OR c.community_name ILIKE '%' || $1 || '%'
                OR c.description ILIKE '%' || $1 || '%'
            )
            ORDER BY p.created_at DESC
            LIMIT ${postLimit}
        `,
        [query, 'publish'],
      );

      if (post.rows.length === 0)
        throw createError("No Post found according to query..");

      return {
        posts: post.rows,
        newCursor: post.rows[post.rows.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async searchpostWithTag(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;
      const q = cursor ? `p.id < '${cursor}' AND` : "";
      const tag = query[0] === "#" ? query : `#${query}`;

      const post = await pool.query(
        `
        SELECT
            p.*,
            c.community_name
        FROM posts p
        LEFT JOIN communities c
            ON p.community_id = c.id
        WHERE
            ${q}
            status = $2
            And
            (
                p.community_id IS NULL
                OR c.privacy != 'private'
            )
            AND (
                $1 = ANY(p.tags)
            )
        ORDER BY p.created_at DESC
        LIMIT $3
        `,
        [tag, 'publish', postLimit],
      );

      if (post.rows.length === 0)
        throw createError("No Post found according to query..");

      return {
        posts: post.rows,
        newCursor: post.rows[post.rows.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async searchProfile(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;
      const q = cursor ? `users.id < '${cursor}' AND` : "";

      const profiles = await pool.query(
        `
          SELECT * FROM users 
          WHERE 
          ${q}
          (
          users.name ILIKE '%' || $1 || '%'
          OR users.username ILIKE '%' || $1 || '%'
          )
          ORDER BY users.followers_count DESC
          LIMIT $2
          `,
        [query, postLimit],
      );

      if (profiles.rows.length === 0)
        throw createError("No profiles found according to query..");

      return {
        profiles: profiles.rows,
        newCursor: profiles.rows[profiles.rows.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async searchCommunity(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;
      const q = cursor ? `communities.id < '${cursor}' AND` : "";

      const communities = await pool.query(
        `
          SELECT * FROM communities 
          WHERE 
          ${q}
          (
          communities.community_name ILIKE '%' || $1 || '%'
          OR communities.description ILIKE '%' || $1 || '%'
          )
          ORDER BY communities.member_count DESC
          LIMIT $2
          `,
        [query, postLimit],
      );

      if (communities.rows.length === 0)
        throw createError("No profiles found according to query..");

      return {
        communities: communities.rows,
        newCursor: communities.rows[communities.rows.length - 1].id,
      };
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
        id <> ALL($2)
        AND
        post_category && $3
      `;

      let feed = await pool.query(
        `SELECT * FROM posts
        WHERE status = $1 AND
        ${query}
          ORDER BY created_at DESC
          LIMIT $4
          `,
        ['publish', visitedFeedIds, feed_category, postLimit],
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
