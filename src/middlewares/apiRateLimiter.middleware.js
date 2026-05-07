const { rateLimit } = require('express-rate-limit')

const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: "Please try after some time...",
})

module.exports = apiRateLimiter
