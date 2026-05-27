const { rateLimit } = require('express-rate-limit')

const apiRateLimiter = rateLimit({
    windowMs:  24 * 60 * 60 * 1000, // 24h
    limit: 1000,                    // 1000 api call
    message: "Please try after some time...",
})

const authRateLimiter = rateLimit({ 
    windowMs: 60 * 60 * 1000,   // 1 hour 
    limit: 10,                   // 10 attempts per hour 
    message: { success: false, message: 'Too many attempts. Try again later.' } 
}); 

module.exports = {apiRateLimiter, authRateLimiter}
