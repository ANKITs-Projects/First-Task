const jwt = require('jsonwebtoken');

class TokenGenerator {
    static generateToke(data, expiresIn, key ) {
        return jwt.sign(data, key, { expiresIn: expiresIn });
    }

    static decodeToken(token, key ) {
        return jwt.verify(token, key)
    } 
}

module.exports = TokenGenerator