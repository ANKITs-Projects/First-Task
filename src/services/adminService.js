const pool = require('../config/pgdb');
const { saveDeleteduserData, getDeleteduserData } = require('../repositories/deletedUsersDataRepositories');
const { getPosts, updatePostRepository } = require('../repositories/postsRepositories');
const { getUsers, deleteUserQuery, getUserByUserId } = require('../repositories/usersRepositories');
const createError = require('../utils/errorObjGenerater')


class AdminServices {
  constructor(){}
  
  async getAllUsers(cursor) {
    try {
      const select = 'name, username, email, role, id';
      const query = `
                    ${cursor ? `id > $2 AND` : ''}
                    role = $1
                    `
      const values = ['user']
      if(cursor) values.push(cursor)
      
      const modifier = 'ORDER BY created_at DESC'

      const users = await getUsers(select, query, values, modifier)

      return {users: users, newCursor: users.length ? users[users.length - 1].id : null}
    } catch (error) {
      throw error
    }
  }

  async deleteUser(userId) {
    try {
      const selectForUser = '*'
      const targetUser = await getUserByUserId(userId, selectForUser)
      
      if (!targetUser) {
        throw createError("User not found!", 404)
      }

      if (targetUser.role === "admin") {
        throw createError("Admin accounts cannot be deleted.", 400)
      }

      const {id} = targetUser

      const selectForPost = 'id'
      const conditionForpost = 'user_id = $1'
      const modifierForPost = ''
      const valueForPost = [id]

      const usersPosts = await getPosts(selectForPost, conditionForpost, modifierForPost, valueForPost)

      const postIds = usersPosts.map(ele => ele.id)

      const deletedUserObject = {
        userProfile: targetUser,
        userPosts:  postIds
      }

      const jsonObj = JSON.stringify(deletedUserObject)

      const userDeletedData = await saveDeleteduserData(jsonObj)
       
      const fieldsToUpdatePost = 'is_delete = $1'
      const conditionToUpdatePost = 'id = ANY($2)'
      const valueToUpdatePost = [true, postIds]
      
      await updatePostRepository(fieldsToUpdatePost, conditionToUpdatePost, valueToUpdatePost)

      await deleteUserQuery(userId)
      
      return userDeletedData
    } catch (error) {
      throw error
    }
  }

  async getDeletedUser(cursor) {
    try {
      const select = '*';
      const query = `
                    ${cursor ? `id > $1` : true}
                    `
      const values = []
      if(cursor) values.push(cursor)
      
      const modifier = ''

      const users = await getDeleteduserData(select, query, values, modifier)

      return {users: users, newCursor: users.length ? users[users.length - 1].id : null}
    } catch (error) {
      throw error
    }
  }
}



module.exports = AdminServices;
