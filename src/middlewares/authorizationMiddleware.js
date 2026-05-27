class AuthorizationMiddleware {
  static authorizeRoles(role) {
    return (req, res, next) => {
      if (role != (req.role)) {
        const err = new Error(`${req.role} is not authorized`);
        err.statusCode = 403
        next(err)
        return
      }
      next();
    };
  }
}


module.exports = AuthorizationMiddleware