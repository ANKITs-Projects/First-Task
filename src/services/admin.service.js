const createError = require('../utils/errorObjGenerater')

class AdminServices {
  constructor(userModel, postModel, commentsModel, likeModel) {
    this.userModel = userModel;
    this.postModel = postModel;
    this.commentsModel = commentsModel;
    this.likeModel = likeModel;
  }

  async getAllUsers() {
    try {
      const users = await this.userModel.find({ role: "User" })
      return users
    } catch (error) {
      throw error
    }
  }

  async deleteUser(userId) {
    try {
      const targetUser = await this.userModel.findById(userId);

      if (!targetUser) {
        throw createError("User not found!", 400)
      }

      if (targetUser.role === "Admin") {
        throw createError("Admin accounts cannot be deleted.", 400)
      }

      await this.userModel.deleteOne({ _id: userId });
    } catch (error) {
      throw error
    }
  }
}

module.exports = AdminServices;
