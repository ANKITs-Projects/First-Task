const PasswordHashing = require("../utils/password.hashing");
const TokenGenerator = require("../utils/token.generator");
const createError = require('../utils/errorObjGenerater');
const sendEmail = require('../utils/email service/sendMail')
const pool = require('../config/pgdb');
const { uploadOnCloudinary } = require("../utils/cloudinary");


class AuthServices {
  constructor() {}

  async signUp(data) {
    try {
      const { name, username, email, password, avatar, banner } = data;


      const user = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
      )

      if (user.rows.length > 0) {
        throw createError("User already exist", 400)
      }

      const avatar_url = avatar ? await uploadOnCloudinary(avatar) : null
      const banner_url = banner ? await uploadOnCloudinary(banner) : null

      
    
      const hashedPassword = await PasswordHashing.hashing(password);

      const newUser = await pool.query(
        `INSERT INTO users (name, username, email, password_hash, avatar_url, banner_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, username, email`,
        [name, username, email, hashedPassword, avatar_url, banner_url]
      )

      return newUser.rows[0]
    } catch (error) {
      throw error
    }
  }

  async login(data) {
    try {
      const { email, password } = data;


      const user = await pool.query(
        'SELECT username, id, password_hash, role FROM users WHERE email=$1',
        [email]
      )
      if (user.rows.length == 0) throw createError("User not exist", 404)
      
      const {password_hash, username, id, role} = user.rows[0]
      
      const isValied = await PasswordHashing.comparing(password, password_hash)

      if (!isValied) throw createError("Password is not correct", 400)

      const token = TokenGenerator.generateToke({
        userId: id,
        role: role,
      }, process.env.TOKEN_EXPIRESIN, process.env.TOKEN_SECRET_KEY)

      const refreshToken = TokenGenerator.generateToke({
        userId: id
      }, process.env.REFRESH_TOKEN_EXPIRESIN, process.env.REFRESH_TOKEN_SECRET_KEY)

      
      await pool.query(
        'UPDATE users SET refresh_token = $1 WHERE id = $2',
        [refreshToken, id]
      )

      const userdata = {username, id, role}

      return { userdata, token, refreshToken}
    } catch (error) {
      throw error
    }
  }

  async profile(userId) {
    try{
      const user = await pool.query(
        `
        SELECT name, username, email, avatar_url, banner_url, role, followers_count, following_count, is_verified
        FROM users
        WHERE id = $1  
        `,
        [userId]
      )

      if(user.rows.length == 0)
        throw createError("user not exist..", 400)

      return user.rows[0]
    }catch(error){
      throw error
    }
  }

  async sendEmailVerification(userId) {
    try {

      const user = await pool.query(
        'SELECT email, is_verified FROM users WHERE id = $1',
        [userId]
      )
      if(user.rows.length == 0){
        throw createError("User not exist", 400)
      }

      const {email, is_verified} = user.rows[0]

      if(is_verified) throw createError("Email already verified", 409)
        

      const token = TokenGenerator.generateToke({userId: userId}, process.env.VERIFY_TOKEN_EXPIRESIN, process.env.VERIFY_TOKEN_SECRET_KEY)

      await pool.query(
        'UPDATE users SET email_verification_token = $1 WHERE id = $2',
        [token, userId]
      )

      const body = `
            <h1>Email Verification</h1>
            <p>Click below to verify your email</p>

            <a href="http://localhost:8000/api/auth/verify-email/${token}">
               http://localhost:8000/api/auth/verify-email/${token}
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

      const user = await pool.query(
        'SELECT email_verification_token FROM users WHERE id=$1',
        [userId]
      )

      if(user.rows.length == 0 || !user.rows[0].email_verification_token || (token != user.rows[0].email_verification_token)) 
        throw createError("Invalid verification token", 400)

      user.isVerified = true
      user.emailVerificationToken = null

      await pool.query(
        'UPDATE users SET email_verification_token = $1, is_verified = $2 WHERE id=$3',
        [null, true, userId]
      )
      
    } catch (error) {
      throw error
    }
  }

  async forgetPassword(mail) {
    try {

      const user = await pool.query(
        'SELECT id FROM users WHERE email=$1',
        [mail]
      )

      if(user.rows.length == 0){
        throw createError("User not exist", 400)
      }
        
      const {id} = user.rows[0]
      const token = TokenGenerator.generateToke({userId: id}, process.env.VERIFY_TOKEN_EXPIRESIN, process.env.VERIFY_TOKEN_SECRET_KEY)

      
      await pool.query(
        'UPDATE users SET reset_password_token=$1 WHERE id=$2',
        [token, id]
      )
      
      
      const body = `
      <h1>Reset Password</h1>
            <p>Click below to reset the password</p>
            
            <a href="http://localhost:8000/api/auth/verify-password-token/${token}">
                http://localhost:8000/api/auth/verify-password-token/${token}
            </a>
            `
            
      await sendEmail(mail, body) 

    } catch (error) {
      throw error
    }
  }

  async verifyPasswordToken(token) {
    try {
      const {userId} = TokenGenerator.decodeToken(token, process.env.VERIFY_TOKEN_SECRET_KEY)


      const user = await pool.query(
        'SELECT reset_password_token FROM users WHERE id = $1',
        [userId]
      )

      if(!user.rows.length || !user.rows[0].reset_password_token || (token != user.rows[0].reset_password_token)) 
        throw createError("Invalid verification token", 400)

    } catch (error) {
      throw error
    }
  }

  async changePassword(token, {password}) {
    try {
      const {userId} = TokenGenerator.decodeToken(token, process.env.VERIFY_TOKEN_SECRET_KEY)

      const user = await pool.query(
        'SELECT reset_password_token FROM users WHERE id = $1',
        [userId]
      )

      if(!user.rows.length || !user.rows[0].reset_password_token || (token != user.rows[0].reset_password_token)) 
        throw createError("Invalid verification token", 400)
      
      const hashedPassword = await PasswordHashing.hashing(password);
      
      await pool.query(
        'UPDATE users SET password_hash = $1, reset_password_token = $2 WHERE id = $3',
        [hashedPassword, null, userId]
      )

    } catch (error) {
      throw error
    }
  }

}

module.exports = AuthServices;
