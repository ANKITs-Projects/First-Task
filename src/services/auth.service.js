const PasswordHashing = require("../utils/password.hashing");
const TokenGenerator = require("../utils/token.generator");
const createError = require('../utils/errorObjGenerater')


class AuthServices {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async signUp(data) {
    try {
      const { name, email, password } = data;

      const user = await this.userModel.findOne({ email });

      if (user) {
        throw createError("User already exist", 400)
      }

      const hashedPassword = await PasswordHashing.hashing(password);

      const newUser = await this.userModel.create({
        name: name,
        email: email,
        password: hashedPassword
      })

      const userObj = newUser.toObject()
      delete userObj.password

      return userObj
    } catch (error) {
      throw error
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      const user = await this.userModel.findOne({ email }).select('+password')

      if (!user) throw createError("User not exist", 404)

      const isValied = await PasswordHashing.comparing(password, user.password)

      if (!isValied) throw createError("Password is not correct", 400)

      const token = TokenGenerator.generateToke({
        userId: user._id,
        role: user.role,
      }, process.env.TOKEN_EXPIRESIN, process.env.TOKEN_SECRET_KEY)

      const refreshToken = TokenGenerator.generateToke({
        userId: user._id
      }, process.env.REFRESH_TOKEN_EXPIRESIN, process.env.REFRESH_TOKEN_SECRET_KEY)

      user.refreshToken = refreshToken
      
      await user.save()

      const userdata = {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
      return { userdata, token, refreshToken}
    } catch (error) {
      throw error
    }
  }

}

module.exports = AuthServices;
