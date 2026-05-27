// const TokenGenerator = require('./token.generator')

function apiResponse(data, message="Success") {
    if(data == null){
        return {
            success: true,
            message: message
        }
    }
    //const key = process.env.RESPONCE_DATA_SECRET_KEY
    //const encreptedData = TokenGenerator.generateToken(data,  process.env.RESPONCE_DATA_EXPIRESIN, key)

    return {
        success: true,
        message: message,
        data: data
    }
}

module.exports = apiResponse