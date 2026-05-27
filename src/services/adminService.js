const pool = require('../config/pgdb');
const { getUsers, deleteUserQuery, getUserByUserId } = require('../repositories/usersRepositories');
const createError = require('../utils/errorObjGenerater')


class AdminServices {
  constructor(){}
  
  async getAllUsers(cursor) {
    try {
      const select = 'name, username, email, role, id';

      const q = cursor ? `id > $2 AND` : '';
      const values = ['user']

      if(cursor){
        values.push(cursor)
      }

      const query = `
        WHERE 
        ${q}
        role = $1
        ORDER BY created_at DESC
        `

      const users = await getUsers(select, query, values)

      if(!users.length){
        throw createError("No More Users..", 400)
      }

      return {users: users, newCursor: users[users.length - 1].id}
    } catch (error) {
      throw error
    }
  }

  async deleteUser(userId) {
    try {
      const select = 'role'
      const targetUser = await getUserByUserId(userId, select)
      
      if (!targetUser) {
        throw createError("User not found!", 404)
      }

      if (targetUser.role === "admin") {
        throw createError("Admin accounts cannot be deleted.", 400)
      }


      await deleteUserQuery(userId)
    } catch (error) {
      throw error
    }
  }
}

module.exports = AdminServices;
