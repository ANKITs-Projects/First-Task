const pool = require('../config/pgdb');
const createError = require('../utils/errorObjGenerater')

class AdminServices {
  constructor(){}
  
  async getAllUsers(cursor) {
    try {
      const q = cursor ? `id > '${cursor}' AND` : '';

      const users = await pool.query(
        `
        SELECT name, username, email, role, id, created_at FROM users
        WHERE 
        ${q}
        role = $1
        `,
        ['user']
      )

      if(users.rows.length == 0){
        throw createError("No More Users..", 400)
      }

      return {users: users.rows, newCursor: users.rows[users.rows.length - 1].id}
    } catch (error) {
      throw error
    }
  }

  async deleteUser(userId) {
    try {
      
      const targetUser = await pool.query(
        `
        SELECT id FROM users
        WHERE id = $1
        `,
        [userId]
      )
      
      if (!targetUser.rows.length) {
        throw createError("User not found!", 400)
      }

      if (targetUser.rows[0].role === "Admin") {
        throw createError("Admin accounts cannot be deleted.", 400)
      }


      await pool.query(
        `
        DELETE FROM users WHERE id = $1;
        `,
        [userId]
      )
    } catch (error) {
      throw error
    }
  }
}

module.exports = AdminServices;
