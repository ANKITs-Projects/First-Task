const userModel = require("../models/user.model")
const TokenGenerator = require("./token.generator")

const verifyRefreshToken = async (reftoken) => {
    try {
        const verifytoken = TokenGenerator.decodeToken(reftoken, process.env.REFRESH_TOKEN_SECRET_KEY)

        const {userId} = verifytoken
        
        const user = await userModel.findById(userId).select('+refreshToken')

        if(!user) throw new Error("user not found..")

        if(user.refreshToken !== reftoken){
            throw new Error("Invalid token")
        }

        const newToken = TokenGenerator.generateToke({
        userId: user._id,
        role: user.role,
      }, process.env.TOKEN_EXPIRESIN, process.env.TOKEN_SECRET_KEY)

      return newToken
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = verifyRefreshToken