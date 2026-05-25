const TokenGenerator = require("./token.generator")

const pool = require('../config/pgdb')

const verifyRefreshToken = async (reftoken) => {
    try {
        const verifytoken = TokenGenerator.decodeToken(reftoken, process.env.REFRESH_TOKEN_SECRET_KEY)

        const {userId} = verifytoken
        
        const user = await pool.query(
            `
            SELECT refresh_token FROM users
            WHERE id = $1
            `,
            [userId]
        )

        if(!user.rows.length) throw new Error("user not found..")

        if(user.rows[0].refresh_token !== reftoken){
            throw new Error("Invalid token")
        }

        const newToken = TokenGenerator.generateToke({
        userId: user._id,
        role: user.role,
      }, process.env.TOKEN_EXPIRESIN, process.env.TOKEN_SECRET_KEY)

      return newToken
    } catch (error) {
        throw error
    }
}

module.exports = verifyRefreshToken