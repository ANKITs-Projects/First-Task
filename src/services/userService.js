const TokenGenerator = require("../utils/tokenGenerator");
const createError = require("../utils/errorObjGenerater");
const { uploadOnCloudinary } = require("../config/cloudinary");
const pool = require("../config/pgdb");
const { getUsersCategoryByUserId, createNewUsersCategory, updateUsersCategory } = require("../repositories/usersCategoryRepositories");
const { updateOrCreateUsersFeedCategory, getUsersFeedCategory } = require("../repositories/usersFeedCatecoryRepositories");
const { getCommunityById, getCommunity, updateCommunity, createCommunityRepostory } = require("../repositories/communitiesRepositories");
const { getCommunityMemberByUserId, makeCommunityMember, getCommunityMember, updateCommunityMember } = require("../repositories/communityMembers");
const { createNewPost, getPostByPostId, updatePostRepository, getPosts, searchPost } = require("../repositories/postsRepositories");
const { createComment, getCommentRepository } = require("../repositories/commentsRepositories");
const { createOrUpdatePostVisitedByUser, getVisitedPostsByUserId } = require("../repositories/postVisitedbyUserRepositories");
const { toggleLikeRepository } = require("../repositories/likesRepositories");
const { followRepository, getFollowersRepository, getFollowingRepository } = require("../repositories/followersRepositories");
const { getUserByUserId, updateUser, getUsers } = require("../repositories/usersRepositories");
const { createnotification, getAllNotification } = require("../repositories/notificationRepositories");

class UserServices {
  constructor(){}

  async setCategory(category, userid) {
    try {
      const select = 'category'
      const userCategory = await getUsersCategoryByUserId(userid, select)

      if (userCategory)
        throw createError("User's Category already exist", 400);

      const newUsersCategory = await createNewUsersCategory(userid, category)

      await updateOrCreateUsersFeedCategory(userid, category);

      return newUsersCategory;
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(data, userid) {
    try {
      const { category } = data;

      const result = await updateUsersCategory(userid, category)

      await updateOrCreateUsersFeedCategory(userid, category);

      return result;
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
        const community = await getCommunityById(community_id, 'id')
        if (!community)
          throw createError("Community not exist..", 400);

        const member = await getCommunityMemberByUserId(userId, community_id)

        if (!member)
          throw createError("You are not the member of this community", 400);

        if (!member.can_post)
          throw createError("You are not allowed to post in this community", 400);
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

      const fields = 'user_id, community_id, title, content, tags, media_urls, post_type, post_category, status'
      const valueNotation = '$1, $2, $3, $4, $5, $6, $7, $8, $9'
      const values = [
          userId,
          community_id,
          title,
          content,
          tags,
          media_urls,
          post_type,
          post_category,
          status
        ]
      
      const newPost = await createNewPost(fields, valueNotation, values)

      await updateOrCreateUsersFeedCategory(userId, post_category);


      return newPost;
    } catch (error) {
      throw error;
    }
  }

  async updatePost(data, postId, userId) {
    try {
      const select = 'title, content, tags, post_category'
      const postData = await getPostByPostId(postId, select)

      if(!postData)
        throw createError('Post not found', 400)


      let { title = postData.title,
         content= postData.content,
          tags = postData.tags, 
          post_category = postData.post_category,} = data;

      const fields = 'title = $1, content = $2, tags = $3, post_category = $4'
      const condition = 'id = $5 AND user_id = $6'
      const values = [title, content, tags, post_category, postId, userId]

      const post = await updatePostRepository(fields, condition, values)

      return post
    } catch (error) {
      throw error
    }
  }

  async publishDraftPost(postId, userId) {
    try {
      
      const select = 'status'
      const postData = await getPostByPostId(postId, select)

      if(!postData)
        throw createError('Post not found', 400)

      if(postData.status === 'publish')
        throw createError('Post already published', 400)

      const fields = 'status = $1'
      const condition = 'id = $2 AND user_id = $3'
      const values = ['publish', postId, userId]

      const post = await updatePostRepository(fields, condition, values)
      return post
    } catch (error) {
      throw error
    }
  }

  async makeComment(userid, postid, parentCommentId, comment) {
    try {
      const select = 'post_category, status'
      const post = await getPostByPostId(postid, select)

      if (!post) throw createError("Post is not found!!", 404);

      const fields = 'post_id, user_id, parent_comment_id, comment'
      const valueNotation = '$1, $2, $3, $4'
      const values = [postid, userid, parentCommentId, comment]
      
      const newComment = await createComment(fields, valueNotation, values)

      const postField = 'comments_count = comments_count + 1'
      const postCondition = 'id = $1'
      const postValues = [postid]
      await updatePostRepository(postField, postCondition, postValues)

      const category = post.post_category;
      await updateOrCreateUsersFeedCategory(userid, category);

      await createOrUpdatePostVisitedByUser(postid, userid);

      return newComment;
    } catch (error) {
      throw error;
    }
  }

  async getComment(postId) {
    try {
      const select = 'post_category'
      const post = await getPostByPostId(postId, select)

      if(!post)
        throw createError("Post not exist", 400)

      const comments = await getCommentRepository(postId)

      return comments
    } catch (error) {
      throw error;
    }
  }

  async toggleLike(postid, userId) {
    try {
      const postliked = await toggleLikeRepository(userId, postid)

      const isliked = postliked.isliked;

      const postField = `likes_count = likes_count ${isliked ? '+ 1' : '- 1'}`
      const postCondition = 'id = $1'
      const postValues = [postid]
      await updatePostRepository(postField, postCondition, postValues)

      await createOrUpdatePostVisitedByUser(postid, userId);

      return isliked ? "Post liked" : "Post unliked";
    } catch (error) {
      throw error;
    }
  }

  async follow(userId, followingId) {
    try {
      const select = 'id'
      const user = await getUserByUserId(followingId, select)
      if(user.length === 0)
        throw createError("User not exist..", 400)

      const follow = await followRepository(followingId, userId)
      const isfollow = follow.isfollowing

      const followersQuery = `
                            UPDATE users
                            SET followers_count = followers_count ${isfollow ? "+ 1" : "- 1"}
                            WHERE id = $1
                            `
      const followervalues = [followingId]
      await updateUser(followersQuery, followervalues)

      const followingQuery = `
                              UPDATE users
                              SET following_count = following_count ${isfollow ? "+ 1" : "- 1"}
                              WHERE id = $1
                              `
      const followingvalues = [userId]
      updateUser(followingQuery, followingvalues)

      return follow

    } catch (error) {
      throw error
    }
  }

  async getFollowers(userId) {
    try {
      const follower = await getFollowersRepository(userId)

      return follower
    } catch (error) {
      throw error
    }
  }

  async getFollowing(userId) {
    try {
      const following = await getFollowingRepository(userId)

      return following
    } catch (error) {
      throw error
    }
  }

  async getallMypost(userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const select = '*'
      const condition = `${cursor ? 'id < $4 AND' : ''}
                          user_id = $1 AND
                          STATUS = $2
                        `
      const modifier = 'ORDER BY created_at DESC LIMIT $3'
      const values = [userId, 'publish', postLimit]
      if(cursor) values.push(cursor)

      const posts = await getPosts(select, condition, modifier, values)

      if (posts.length === 0) { 
      return {
        post: posts,
        newCursor: null
      };
      }

      return {
        post: posts,
        newCursor: posts[posts.length - 1].id
      };
    } catch (error) {
      throw error;
    }
  }

  async getDraftPost (userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const select = '*'
      const condition = `${cursor ? 'id < $4 AND' : ''}
                          user_id = $1 AND
                          STATUS = $2
                        `
      const modifier = 'ORDER BY created_at DESC LIMIT $3'
      const values = [userId, 'draft', postLimit]
      if(cursor) values.push(cursor)

      const posts = await getPosts(select, condition, modifier, values)

      if (posts.length === 0) {
        const mes = cursor ? "No More Posts" : "There is no posts";
        throw createError(mes, 200);
      }

      return {
        post: posts,
        newCursor: posts[posts.length - 1].id,
      };
    } catch (error) {
      throw error
    }
  }

  async getsharedpost(postId, userId) {
    try {
      const select = '*'
      const condition = ` id = $1 AND
                          STATUS = $2
                        `
      const modifier = ''
      const values = [postId, 'publish',]

      const post = await getPosts(select, condition, modifier, values)

      if (post.length === 0) throw createError("Post not found", 404);

      if (post[0].community_id) {
        const community_id = post[0].community_id;

        const selectFromCommunity = 'privacy'
        const community = await getCommunityById(community_id, selectFromCommunity)

        if (community.privacy === "private") {

          const isMember = await getCommunityMemberByUserId(userId, community_id)

          if (!isMember)
            throw createError(
              "You can not see this post you are not the member of the community",
              400,
            );
        }
      }

      const postField = 'share_count = share_count + 1'
      const postCondition = 'id = $1'
      const postValues = [postId]
      await updatePostRepository(postField, postCondition, postValues)

      const category = post[0].post_category;
      
      await updateOrCreateUsersFeedCategory(userId, category);

      await createOrUpdatePostVisitedByUser(postId, userId);

      return post[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllPostByUserId(userId, cursor) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const select = '*'
      const condition = `${cursor ? 'id < $4 AND' : ''}
                          user_id = $1 AND
                          STATUS = $2
                        `
      const modifier = 'ORDER BY created_at DESC LIMIT $3'
      const values = [userId, 'publish', postLimit]
      if(cursor) values.push(cursor)

      const posts = await getPosts(select, condition, modifier, values)

      if (posts.length === 0) {
        return {
        post: posts,
        newCursor: null
      };
      }

      return {
        post: posts,
        newCursor: posts[posts.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async createCommunity(data, userId) {
    try {
      
      const { community_name, description, category, avatar, banner, privacy } =
        data;

      const selectFromCommunity = "*"
      const queryforCommunity = 'community_name = $1'
      const valuesForCommunity = [community_name]
      const communityExist = await getCommunity(selectFromCommunity, queryforCommunity, valuesForCommunity)

      if(communityExist.length > 0) {
        throw createError("Community with same name already exist..", 400)
      }

      const avatar_url = avatar ? await uploadOnCloudinary(avatar) : null;
      const banner_url = banner ? await uploadOnCloudinary(banner) : null;

      const fieldsForCommunity = 'community_name, description, category, avatar_url, banner_url, owner_id, privacy'
      const valueNotationForCommunity = '$1, $2, $3, $4, $5, $6, $7'
      const values = [ community_name, description, category, avatar_url,  banner_url, userId, privacy ]

      const community = await createCommunityRepostory(fieldsForCommunity, valueNotationForCommunity, values)

      const community_id = community.id;

      const fieldsForCommunityMember = 'user_id, community_id, role'
      const valueNotationForCommunityMember = '$1,$2,$3'
      const valuesForCommunityMember =  [userId, community_id, "admin"]

      await makeCommunityMember(fieldsForCommunityMember, valueNotationForCommunityMember, valuesForCommunityMember)
      
      return community;
    } catch (error) {
      throw error;
    }
  }

  async getAllPostByCommunityId(communityid, cursor, userId) {
    try {

      const selectFromCommunity = 'privacy'

      const community = await getCommunityById(communityid, selectFromCommunity)

      if (!community)
        throw createError("Community not exist..", 404);

      if (community.privacy === "private") {
  
        const member = await getCommunityMemberByUserId(userId, communityid)

        if (!member)
          throw createError(
            "This is a privet community and you are not the member of this community",
            401,
          );
      }

      
      const postLimit = process.env.POST_LIMIT;
      
      const selectFromPosts = '*'
      const conditionForposts = `${cursor ? 'id < $4 AND': ''} status = $1 AND community_id = $2`
      const modifierForPosts = 'ORDER BY created_at DESC LIMIT $3'
      const valuseForPosts = ['publish', communityid, postLimit]
      if(cursor) valuseForPosts.push(cursor)

      const posts = await getPosts(selectFromPosts, conditionForposts, modifierForPosts, valuseForPosts)

      if (posts.length === 0) {
        return {
          posts: [],
          newCursor: null
        }
      }

      return {
        posts: posts,
        newCursor: posts[posts.length - 1].id,
      };
    } catch (error) {
      throw error;
    }
  }

  async joincommunity(communityid, userid) {
    try {
      const selectFromCommunity = '*'

      const community = await getCommunityById(communityid, selectFromCommunity)

      if (!community)
        throw createError("Community not exist..", 404);

      const isMember = await getCommunityMemberByUserId(userid, communityid)

      if (isMember)
        throw createError("You are already a member..", 400);

      const { privacy } = community;
      let member;

      if (privacy === "public" || privacy == "restricted") {
        const can_post = privacy === "public";

        const fieldsForCommunityMember = 'user_id, community_id, can_post'
        const valueNotationForCommunityMember = '$1, $2, $3'
        const valuesForCommunityMember = [userid, communityid, can_post]

        member = await makeCommunityMember(fieldsForCommunityMember, valueNotationForCommunityMember, valuesForCommunityMember)


      } else {

        const selectFromCommunityMember = 'user_id'
        const queryforCommunityMember = 'community_id = $1 AND role = $2'
        const valuesForCommunityMember = [communityid, "admin"]

        const admin = await getCommunityMember(selectFromCommunityMember, queryforCommunityMember, valuesForCommunityMember)

        const { community_name, id } = community;

        const message = `
          UserId:- ${userid}
          Requesting to join the community:- ${community_name}
          CommunityId:- ${id}
          `;

        const values = [];
        const placeholders = admin.map((ele, index) => {
            const base = index * 3;

            values.push(ele.user_id, message, userid);

            return `($${base + 1}, $${base + 2}, $${base + 3})`;
          })
          .join(", ");

        
        const fieldsForNotification = 'receiver_id, message, sender_id'
        const valueNotationForNotification = placeholders
        const valuesForNotification = values

        const notify = await createnotification(fieldsForNotification, valueNotationForNotification, valuesForNotification)

        return { data: notify, message: "Request to join" };
      }

      const fieldsToUpdateCommunity = 'member_count = member_count + 1'
      const queryToUpdateCommunity = 'id=$1'
      const valuesToUpdateCommunity = [communityid]

      await updateCommunity(fieldsToUpdateCommunity, queryToUpdateCommunity, valuesToUpdateCommunity)

      return {
        data: member,
        message: `You are joined to ${community.community_name} community`,
      };
    } catch (error) {
      throw error;
    }
  }

  async getNotification(userId) {
    try {
      const selectFromNotification = '*'
      const queryforNotification = 'receiver_id = $1'
      const modifierForNotification = 'ORDER BY created_at DESC'
      const valuesForNotification = [userId]
      const notification = await getAllNotification(selectFromNotification, queryforNotification, modifierForNotification, valuesForNotification)

      return notification

    } catch (error) {
      throw error
    }
  }

  async reqToPostInCommunity(communityid, userid) {
    try {

      const selectFromCommunity = '*'

      const community = await getCommunityById(communityid, selectFromCommunity)

      if (!community)
        throw createError("Community not exist..", 404);

      const isMember = await getCommunityMemberByUserId(userid, communityid)

      if (!isMember) throw createError("You are not member..", 400);

      if (isMember.can_post)
        throw createError("You already can post", 400);

      const selectFromCommunityMember = 'user_id'
      const queryforCommunityMember = 'community_id = $1 AND role = $2'
      const valuesForCommunityMember = [communityid, "admin"]

      const admin = await getCommunityMember(selectFromCommunityMember, queryforCommunityMember, valuesForCommunityMember)

      const { community_name, id } = community;

      const message = `
        UserId:- ${userid}
        Requesting to make post in the community:- ${community_name}
        CommunityId:- ${id}
        `;

      const values = [];
      const placeholders = admin.map((ele, index) => {
          const base = index * 3;

          values.push(ele.user_id, message, userid);

          return `($${base + 1}, $${base + 2}, $${base + 3})`;
        })
        .join(", ");

      const fieldsForNotification = 'receiver_id, message, sender_id'
      const valueNotationForNotification = placeholders
      const valuesForNotification = values

      const notify = await createnotification(fieldsForNotification, valueNotationForNotification, valuesForNotification)


      return {
        data: notify,
        message: "Notification send successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async acceptReqToJoinCommunity(data, userId) {
    try {
      const { communityId, requesterId } = data;
      
      const selectFromCommunity = '*'

      const community = await getCommunityById(communityId, selectFromCommunity)

      if (!community)
        throw createError("Community not exist..", 404);

      const admin = await getCommunityMemberByUserId(userId, communityId)

      if (!admin)
        throw createError("You are not member of the community", 400);

      if (admin.role != "admin")
        throw createError("You are not admin", 403);

      const isAlreadyMember = await getCommunityMemberByUserId(requesterId, communityId)

      if (isAlreadyMember)
        throw createError("He is already a member of this community..", 400);

      const fieldsForCommunityMember = 'user_id, community_id, can_post'
      const valueNotationForCommunityMember = '$1, $2, $3'
      const valuesForCommunityMember = [requesterId, communityId, false]

      const member = await makeCommunityMember(fieldsForCommunityMember, valueNotationForCommunityMember, valuesForCommunityMember)

      const fieldsToUpdateCommunity = 'member_count = member_count + 1'
      const queryToUpdateCommunity = 'id = $1'
      const valuesToUpdateCommunity = [communityId]

      await updateCommunity(fieldsToUpdateCommunity, queryToUpdateCommunity, valuesToUpdateCommunity)

      // send notification to requester
      const { community_name, id } = community;
      const message = `
        You have joined the community:- ${community_name}
        CommunityId:- community Id: ${id}
        `;

      const fieldsForNotification = 'receiver_id, message, sender_id'
      const valueNotationForNotification = '$1, $2, $3'
      const valuesForNotification = [requesterId, message, userId]

      const notify = await createnotification(fieldsForNotification, valueNotationForNotification, valuesForNotification)

      return member;
    } catch (error) {
      throw error;
    }
  }

  async acceptReqToPostInCommunity(data, userId) {
    try {
      const { communityId, requesterId } = data;

      const selectFromCommunity = '*'

      const community = await getCommunityById(communityId, selectFromCommunity)

      if (!community)
        throw createError("Community not exist..", 404);

      const admin = await getCommunityMemberByUserId(userId, communityId)

      if (!admin)
        throw createError("You are not member of the community", 400);

      if (admin.role != "admin")
        throw createError("You are not admin", 403);

      const isAlreadyCanPost = await getCommunityMemberByUserId(requesterId, communityId)

      if (!isAlreadyCanPost)
        throw createError("He is not member of this community..", 400);

      if (isAlreadyCanPost.can_post)
        throw createError("He is already can post...", 400);

      const fieldsToUpdateCommunityMember = 'can_post = $3'
      const conditionToUpdateCommunityMember = 'user_id = $1 AND community_id = $2'
      const valuesToUpdateCommunityMember = [requesterId, communityId, true]

      const member = await updateCommunityMember(fieldsToUpdateCommunityMember, conditionToUpdateCommunityMember, valuesToUpdateCommunityMember)


      const { community_name, id } = community;
      const message = `
        You can post now in this community:- ${community_name}
        CommunityId:- community Id: ${id}
        `;

      const fieldsForNotification = 'receiver_id, message, sender_id'
      const valueNotationForNotification = '$1, $2, $3'
      const valuesForNotification = [requesterId, message, userId]

      const notify = await createnotification(fieldsForNotification, valueNotationForNotification, valuesForNotification)

      return member;
    } catch (error) {
      throw error;
    }
  }

  async searchpost(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;
      const q = cursor ? `p.id < '${cursor}' AND` : "";

      const selectFromPosts = 'posts.*, c.community_name'
      const joinCondition =  'LEFT JOIN communities c ON posts.community_id = c.id'
      const queryCondition = `${cursor ? `posts.id < $4 AND` : ''}
                        status = $1        
                        AND
                        (
                            posts.community_id IS NULL
                            OR c.privacy != 'private'
                        )
                        AND (
                            posts.title ILIKE '%' || $2 || '%'
                            OR posts.content ILIKE '%' || $2 || '%'
                            OR c.community_name ILIKE '%' || $2 || '%'
                            OR c.description ILIKE '%' || $2 || '%'
                        )
                        `
      const modifier = 'ORDER BY posts.created_at DESC LIMIT $3'
      const values = ['publish', query,  postLimit]
      if(cursor) values.push(cursor)

      const posts = await  searchPost(selectFromPosts, joinCondition, queryCondition, modifier, values)

      return {
        posts: posts,
        newCursor: posts[posts.length - 1] ? posts[posts.length - 1].id : null
      };
    } catch (error) {
      throw error;
    }
  }

  async searchpostWithTag(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;
      
      const tag = query[0] === "#" ? query : `#${query}`;

      const selectFromPosts = 'posts.*, c.community_name'
      const joinCondition =  'LEFT JOIN communities c ON posts.community_id = c.id'
      const queryCondition = `${cursor ? `posts.id < $4 AND` : ''}
                              status = $1        
                              And
                              (
                                  posts.community_id IS NULL
                                  OR c.privacy != 'private'
                              )
                              AND (
                                  $2 = ANY(posts.tags)
                              )
                              `   
      const modifier = 'ORDER BY posts.created_at DESC LIMIT $3'
      const values = ['publish', tag,  postLimit]
      if(cursor) values.push(cursor)

      const posts = await  searchPost(selectFromPosts, joinCondition, queryCondition, modifier, values)

      return {
        posts: posts,
        newCursor: posts[posts.length - 1] ? posts[posts.length - 1].id : null
      };
    } catch (error) {
      throw error;
    }
  }

  async searchProfile(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const selectFromUsers = 'id, name, username, avatar_url, followers_count, following_count, is_verified'
      const queryForUsers = `${cursor ? 'id < $3 AND' : ''}
                            (
                            name ILIKE '%' || $1 || '%'
                            OR username ILIKE '%' || $1 || '%'
                            )
                            `
      const modifierForUsers = 'ORDER BY followers_count DESC LIMIT $2'
      const ValuesForUsers = [query, postLimit]
      if(cursor) ValuesForUsers.push(cursor)

      const profiles = await getUsers(selectFromUsers, queryForUsers, ValuesForUsers, modifierForUsers)

      return {
        profiles: profiles,
        newCursor: profiles[profiles.length - 1] ? profiles[profiles.length - 1].id : null
      };
    } catch (error) {
      throw error;
    }
  }

  async searchCommunity(query, cursor, userId) {
    try {
      const postLimit = process.env.POST_LIMIT;

      const selectFromCommunities = '*'
      const queryforCommunities = `${cursor ? `id < $3 AND` : ''}
                                  (
                                  community_name ILIKE '%' || $1 || '%'
                                  OR description ILIKE '%' || $1 || '%'
                                  )
                                  `
      const modifierForCommunity = 'ORDER BY member_count DESC LIMIT $2'
      const valuesForCommunity = [query, postLimit]
      if(cursor) valuesForCommunity.push(cursor)

      const communities = await getCommunity(selectFromCommunities, queryforCommunities, valuesForCommunity, modifierForCommunity)


      return {
        communities: communities,
        newCursor: communities[communities.length - 1] ? communities[communities.length - 1].id : null
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
        visitedFeedIds = TokenGenerator.decodeToken( visitedfeedToken, process.env.VISITED_FEED_TOKEN).feedIds;
      }

      
      const selectFromVisitedPost = 'post_id'

      const visitedPosts = await getVisitedPostsByUserId(selectFromVisitedPost, userId)

      if (visitedPosts.length > 0) {
        const visitedPostIds = visitedPosts.map((item) => item.post_id);
        visitedFeedIds.push(...visitedPostIds);
      }


      const category = await getUsersFeedCategory(userId)

      const feed_category = category.feed_category;


      let selectFromPosts = '*'
      let conditionForposts =  `status = $1 AND
                                  id <> ALL($2) AND
                                  post_category && $3
                                `
      let modifierForPosts = 'ORDER BY created_at DESC LIMIT $4'
      let valuesForPosts = ['publish', visitedFeedIds, feed_category, postLimit]

      let feed = await getPosts(selectFromPosts, conditionForposts, modifierForPosts, valuesForPosts)

      let removeToken = false;

      if (feed.length == 0) {
        removeToken = true;

         conditionForposts = true
         modifierForPosts = 'ORDER BY created_at DESC, likes_count DESC LIMIT $1'
         valuesForPosts = [postLimit]
        feed = await getPosts(selectFromPosts, conditionForposts, modifierForPosts, valuesForPosts)
      }

      const feedIds = feed.map((ele) => ele.id);

      feedIds.push(...visitedFeedIds);

      const token = TokenGenerator.generateToken(
        { feedIds: feedIds },
        Number(process.env.VISITED_FEED_TOKEN_EXPIRESIN),
        process.env.VISITED_FEED_TOKEN,
      );

      return { feed: feed, token, removeToken };
    } catch (error) {
      throw error;
    }
  }


}

module.exports = UserServices;
