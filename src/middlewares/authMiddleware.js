const TokenGenerator = require("../utils/token.generator");
const verifyRefreshToken = require("../utils/verify.refresh.token");

class AuthMiddleware {
  static verifyToken(req, res, next) {
    try {
      let token = req.cookies.authToken;
      const refreshToken = req.cookies.authRefreshToken;

      if (!token) {
        const err = new Error("Login again..");
        err.statusCode = 400
        next(err)
        return
      }

      let verify;

      try {
        verify = TokenGenerator.decodeToken(
          token,
          process.env.TOKEN_SECRET_KEY,
        );
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          try {
            token = verifyRefreshToken(refreshToken);
            verify = TokenGenerator.decodeToken(
              token,
              process.env.TOKEN_SECRET_KEY,
            );
          } catch (refreshError) {
            const err = new Error("Invalid refresh token")
            err.statusCode = 401
            next(err)
            return
          }
        } else {
          const err = new Error("Invalid access token")
            err.statusCode = 401
            next(err)
          return;
        }
      }

      if (!verify) {
        const err = new Error("Unauthorized");
        err.statusCode = 401;
        next(err);
        return;
      }

      req.userid = verify.userId;
      req.role = verify.role;
      req.token = token;

      next();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthMiddleware;
