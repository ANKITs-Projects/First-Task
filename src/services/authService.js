const PasswordHashing = require("../utils/passwordHashing");
const TokenGenerator = require("../utils/tokenGenerator");
const createError = require('../utils/errorObjGenerater');
const sendEmail = require('../integrations/email-service/sendMail')
const pool = require('../config/pgdb');
const { uploadOnCloudinary } = require("../config/cloudinary");
const { getUserByEmail, getUserByUserName, createNewUser, updateUser, getUserByUserId } = require("../repositories/usersRepositories");


class AuthServices {
  constructor() {}

  async signUp(data) {
    try {
      const { name, username, email, password, avatar, banner } = data;

      const select = 'id'
      const user = await getUserByEmail(email, select)
      
      if (user) {
        throw createError("User already exist", 400)
      }

      const userName = await getUserByUserName(username)

      if (userName) {
        throw createError("UserName already taken", 400)
      }

      const avatar_url = avatar ? await uploadOnCloudinary(avatar) : null
      const banner_url = banner ? await uploadOnCloudinary(banner) : null
    
      const hashedPassword = await PasswordHashing.hashing(password);

      const fields = 'name, username, email, password_hash, avatar_url, banner_url'
      const valueNotation = '$1, $2, $3, $4, $5, $6'
      const values = [name, username, email, hashedPassword, avatar_url, banner_url]
      
      const newUser = await createNewUser(fields, valueNotation, values)

      return newUser
    } catch (error) {
      throw error
    }
  }

  async login(data) {
    try {
      const { email, password } = data;

      const select = 'username, id, password_hash, role'
      const user = await getUserByEmail(email, select);

      if (!user) throw createError("User not exist", 404)
      
      const {password_hash, username, id, role} = user
      
      const isValid = await PasswordHashing.comparing(password, password_hash)

      if (!isValid) throw createError("Password is not correct", 400)

      const token = TokenGenerator.generateToken({
        userId: id,
        role: role,
      }, process.env.TOKEN_EXPIRESIN, process.env.TOKEN_SECRET_KEY)

      const refreshToken = TokenGenerator.generateToken({
        userId: id,
        role: role
      }, process.env.REFRESH_TOKEN_EXPIRESIN, process.env.REFRESH_TOKEN_SECRET_KEY)

      const sqlQuery = 'UPDATE users SET refresh_token = $2 WHERE id = $1'
      const values = [id, refreshToken]

      await updateUser(sqlQuery, values)

      const userdata = {username, id, role}

      return { userdata, token, refreshToken}
    } catch (error) {
      throw error
    }
  }

  async generateNewToken(userid, role) {
    try {
      const token = TokenGenerator.generateToken({
        userId: userid,
        role: role,
      }, process.env.TOKEN_EXPIRESIN, process.env.TOKEN_SECRET_KEY)

      return token
    } catch (error) {
      throw error
    }
  }

  async profile(userId) {
    try{
      const select = 'name, username, email, avatar_url, banner_url, role, followers_count, following_count';
      const user = await getUserByUserId(userId, select)

      if(!user)
        throw createError("user not exist..", 400)

      return user
    }catch(error){
      throw error
    }
  }

  async sendEmailVerification(userId) {
    try {
      const select = 'email, is_verified';

      const user = await getUserByUserId(userId, select)

      if(!user){
        throw createError("User not exist", 400)
      }

      const {email, is_verified} = user

      if(is_verified) throw createError("Email already verified", 409)
        

      const token = TokenGenerator.generateToken({userId: userId}, process.env.VERIFY_TOKEN_EXPIRESIN, process.env.VERIFY_TOKEN_SECRET_KEY)

      const sqlQuery = 'UPDATE users SET email_verification_token = $2 WHERE id = $1'
      const values = [userId, token]

      await updateUser(sqlQuery, values)
      const baseUrl = process.env.BASE_URL;

      const body = `
            <h1>Email Verification</h1>
            <p>Click below to verify your email</p>
            <a href="${baseUrl}/api/auth/verify-email/${token}">
               ${baseUrl}/api/auth/verify-email/${token}
            </a>
         `

      await sendEmail(email, body)

    } catch (error) {
      throw error
    }
  }

  async verifyemail(token) {
    try {
      const {userId} = TokenGenerator.decodeToken(token, process.env.VERIFY_TOKEN_SECRET_KEY)

      const select = 'email_verification_token, is_verified'
      const user = await getUserByUserId(userId, select)

      if(!user || !user.email_verification_token || (token != user.email_verification_token)) 
        throw createError("Invalid verification token", 400)


      if(user.is_verified) throw createError("Email already verified", 409)


      const sqlQuery = 'UPDATE users SET email_verification_token = $3, is_verified = $2 WHERE id=$1'
      const values = [userId, true, null]
      await updateUser(sqlQuery, values)
      
    } catch (error) {
      throw error
    }
  }

  async forgetPassword(email) {
    try {
      const select = 'id'
      const user = await getUserByEmail(email, select)

      if(!user){
        return 
      }
        
      const {id} = user
      const token = TokenGenerator.generateToken({userId: id}, process.env.VERIFY_TOKEN_EXPIRESIN, process.env.VERIFY_TOKEN_SECRET_KEY)

      const sqlQuery = 'UPDATE users SET reset_password_token=$2 WHERE id=$1'
      const values = [id, token]

      await updateUser(sqlQuery, values)
      const baseUrl = process.env.BASE_URL;
      
      
      const body = `
      <h1>Reset Password</h1>
            <p>Click below to reset the password</p>
            
            <a href="${baseUrl}/api/auth/verify-password-token/${token}">
                ${baseUrl}/api/auth/verify-password-token/${token}
            </a>
            `
            
      await sendEmail(email, body) 

    } catch (error) {
      throw error
    }
  }

  async verifyPasswordToken(token) {
    try {
      const {userId} = TokenGenerator.decodeToken(token, process.env.VERIFY_TOKEN_SECRET_KEY)

      const select = 'reset_password_token';

      const user = await getUserByUserId(userId, select)

      if(!user || !user.reset_password_token || (token != user.reset_password_token)) 
        throw createError("Invalid verification token", 400)

    } catch (error) {
      throw error
    }
  }

  async changePassword(token, password) {
    try {
      const {userId} = TokenGenerator.decodeToken(token, process.env.VERIFY_TOKEN_SECRET_KEY)

      const select = 'reset_password_token';
      const user = await getUserByUserId(userId, select)

      if(!user || !user.reset_password_token || (token != user.reset_password_token)) 
        throw createError("Invalid verification token", 400)

      const hashedPassword = await PasswordHashing.hashing(password);
      
      const sqlQuery = 'UPDATE users SET password_hash = $3, reset_password_token = $2 WHERE id = $1'
      const values = [userId, null, hashedPassword]
      await updateUser(sqlQuery, values)

    } catch (error) {
      throw error
    }
  }

  
}

module.exports = AuthServices;
