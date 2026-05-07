class AuthController {
  constructor(authService) {
    this.authService = authService;
  }


  signup = async (req, res, next) => {
        try {
            const data = await this.authService.signUp(req.body)

            res.status(201).json({
                success: true,
                message: "User created successfuly",
                data
            })
        } catch (error) {
            next(error)
        }
    }

  login = async (req, res, next) => {
    try {
      const { userdata, token, refreshToken} = await this.authService.login(req.body);

      res.cookie("authToken", token, {
        maxAge: 5*60*60*1000 
      })
      res.cookie("authRefreshToken", refreshToken, {
        maxAge: 15*60*60*1000
      })
      res.status(200).json({
          success: true,
          message: `${userdata.role} login successfuly`,
          user: userdata,
        });
    } catch (error) {
      next(error)
    }
  };
}

module.exports = AuthController;
