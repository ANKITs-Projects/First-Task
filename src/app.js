const express = require('express')
const cookieParser = require('cookie-parser')
const adminRoute = require('./routes/admin.route')
const userRoute = require('./routes/user.route')
const authRoute = require('./routes/auth.route')
const superAdmin = require('./routes/superAdmin.route')
const loggerMiddleware = require('./utils/logger')
const apiRateLimiter = require('./middlewares/apiRateLimiter.middleware')



const app = express()

app.use(apiRateLimiter)

app.use(cookieParser())

app.use(express.json())

app.use(loggerMiddleware);

app.use('/api/auth', authRoute)

app.use('/api/user', userRoute)

app.use('/api/admin', adminRoute)
app.use('/api/superadmin', superAdmin)

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500

  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
})

module.exports = app