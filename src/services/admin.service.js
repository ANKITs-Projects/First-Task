const pool = require('../config/pgdb');
const createError = require('../utils/errorObjGenerater')

class AdminServices {
  constructor(userModel, postModel, commentsModel, likeModel) {
    this.userModel = userModel;
    this.postModel = postModel;
    this.commentsModel = commentsModel;
    this.likeModel = likeModel;
  }

  async getAllUsers(cursor) {
    try {
      const q = cursor ? `id > ${cursor} AND` : ''
      // const users = await this.userModel.find({ role: "User" })
      const users = await pool.query(
        `
        SELECT * FROM users
        WHERE 
        ${q}
        role = $1
        `,
        ['user']
      )
      return {users: users.rows, cursor: users.rows[users.rows.length - 1].id}
    } catch (error) {
      throw error
    }
  }

  async deleteUser(userId) {
    try {
      // const targetUser = await this.userModel.findById(userId);
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

      // await this.userModel.deleteOne({ _id: userId });

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
