const { getUserByUserId } = require("../repositories/usersRepositories");
const createError = require("../utils/errorObjGenerater");
const TokenGenerator = require("../utils/tokenGenerator");


class AuthMiddleware {
  static verifyToken(req, res, next) {
    try {
      let token = req.cookies.authToken;

      if (!token) {
        const err = new Error("Login again..");
        err.statusCode = 400
        next(err)
        return
      }

      let verify = TokenGenerator.decodeToken(
          token,
          process.env.TOKEN_SECRET_KEY,
        );

      req.userid = verify.userId;
      req.role = verify.role;
      req.token = token;

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const baseUrl = process.env.BASE_URL;
        res.status(401).json({
          message: `Verify refresh token`,
          redirect_to_url: `${baseUrl}/api/auth/generatenewtoken`
        })
      }
      next(error);
    }
  }

  static async verifyRefreshToken(req, res, next) {
    try {
      const reftoken = req.cookies.authRefreshToken;
      const verifytoken = TokenGenerator.decodeToken(
                      reftoken,
                      process.env.REFRESH_TOKEN_SECRET_KEY,
                    );
                  
      const {userId, role} = verifytoken  

      const selectFromUser = 'refresh_token'
      const user = await getUserByUserId(userId, selectFromUser)

      if(!user) throw createError("user not found..", 404)

      if(user.refresh_token !== reftoken){
          throw createError("Invalid token", 400)
      }

      req.userid = userId;
      req.role = role;

      next()

    } catch (error) {

      if (error.name === "TokenExpiredError") {
        const err = createError("Unauthorized", 401);
        next(err);
        return;
      }

      next(error)
    }
  }
}

module.exports = AuthMiddleware;
