const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console()
  ],
})



const loggerMiddleware = (req, res, next) => {

  const start = Date.now()


  res.on("finish", () => {

    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    }

    if (res.statusCode >= 400) {
      logger.error(logData);
    } else {
      logger.info(logData);
    }
  });

  next()
}



module.exports = loggerMiddleware