const TokenGenerator = require('./token.generator')

function apiResponce(data, message="Success") {
    if(data == null){
        return {
            success: true,
            message: message
        }
    }
    const key = process.env.RESPONCE_DATA_SECRET_KEY
    const encreptedData = TokenGenerator.generateToke(data,  process.env.RESPONCE_DATA_EXPIRESIN, key)

    return {
        success: true,
        message: message,
        encreptedData,
        secretKey: key,
        data: data
    }
}

module.exports = apiResponce