const express = require("express");

const cors = require('cors'); 
const helmet = require('helmet'); 
const cookieParser = require("cookie-parser");

const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const superAdmin = require("./routes/superadminRoute");

const loggerMiddleware = require("./middlewares/loggerMiddleware");
const {apiRateLimiter} = require("./middlewares/apiRateLimiterMiddleware");
const uploadFiles = require("upload-files-express");


app.use(cors({ 
    origin: process.env.ALLOWED_ORIGINS?.split(','), 
    credentials: true, 
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], 
}));  

app.use(helmet());  // sets X-Frame-Options, HSTS, CSP, etc. 

const app = express();

app.use(uploadFiles({
  maxFileSize: 5 * 1024 * 1024
}));

app.use(apiRateLimiter);

app.use(cookieParser());

app.use(express.json());

app.use(loggerMiddleware);

app.use("/api/auth", authRoute);

app.use("/api/user", userRoute);

app.use("/api/admin", adminRoute);
app.use("/api/superadmin", superAdmin);

app.get("/", (req, res) => {
  res.send("API is running...");
});

 
app.use((req, res) => { 
    res.status(404).json({ 
        success: false, 
        message: `Route ${req.method} ${req.originalUrl} not found`, 
    }); 
}); 

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
