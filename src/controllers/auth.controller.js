const apiResponce = require("./../utils/responceObj");

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signup = async (req, res, next) => {
    try {

      const avatar = req.files?.avatar?.[0]?.path || null;
      const banner = req.files?.banner?.[0]?.path || null;

      const data = {
        ...req.body,
        avatar,
        banner
      };

      const result = await this.authService.signUp(data);

      res.status(201).json(apiResponce(result, "User signup Successfully"));
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { userdata, token, refreshToken } = await this.authService.login(
        req.body,
      );

      res.cookie("authToken", token, {
        maxAge: 5 * 60 * 60 * 1000,
      });
      res.cookie("authRefreshToken", refreshToken, {
        maxAge: 15 * 60 * 60 * 1000,
      });
      res.status(200).json(apiResponce(userdata, "User login Successfully"));
    } catch (error) {
      next(error);
    }
  };

  sendEmailVerification = async (req, res, next) => {
    try {
      await this.authService.sendEmailVerification(req.userid);
      res
        .status(200)
        .json(apiResponce(null, "Verification Email send Successfully"));
    } catch (error) {
      next(error);
    }
  };

  verifyemail = async (req, res, next) => {
    try {
      const { token } = req.params;
      await this.authService.verifyemail(token);

      res.status(200).json(apiResponce(null, "Email Verified successfully!!"));
    } catch (error) {
      next(error);
    }
  };

  forgetPassword = async (req, res, next) => {
    try {
      const { email } = req.body;

      await this.authService.forgetPassword(email);

      res.status(200).json(apiResponce(null, "Email send for reset password"));
    } catch (error) {
      next(error);
    }
  };

  verifyPasswordToken = async (req, res, next) => {
    try {
      const { token } = req.params;

      await this.authService.verifyPasswordToken(token);

      res.status(200).json({
        success: true,
        message: "verified successfully",
        redirect_to_url: `/change-password/:token=${token}`,
      });
    } catch (error) {
      next(errer);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { token } = req.params;

      await this.authService.changePassword(token, req.body);

      res
        .status(200)
        .json(apiResponce(null, "Password changed successfully!!"));
    } catch (error) {
      next(error);
    }
  };

  userLogout = async (req, res) => {
    try {
      res.clearCookie("authToken");
      res.clearCookie("authRefreshToken");
      res.clearCookie("visitedfeedToken");
      res.status(200).json(apiResponce(null, "User logout Successfully"));
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Logout fail",
      });
    }
  };
}

module.exports = AuthController;
