const apiResponce = require("../utils/apiResponse");
const createError = require("../utils/errorObjGenerater");
const { validateFileType } = require("../validators/fileTypeValidation");

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  signUp = async (req, res, next) => {
    try {
      
      const avatar = req.files?.avatar?.path || null;
      const banner = req.files?.banner?.path || null;

      const fileTypes = [req.files?.avatar?.type, req.files?.banner?.type]

      if(fileTypes.length > 0 && !validateFileType(fileTypes)){
        throw createError("File type is not allowed", 415)
      }

      console.log(req.files.avatar.type === "image/png")
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
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 5 * 60 * 60 * 1000
      });
      res.cookie("authRefreshToken", refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 15 * 60 * 60 * 1000
      });
      res.status(200).json(apiResponce(userdata, "User login Successfully"));
    } catch (error) {
      next(error);
    }
  };

  generateNewToken = async (req, res, next) => {
    try {
      const userId = req.userid 
      const role = req.role
      const token = await this.authService.generateNewToken(userId, role)

      res.cookie("authToken", token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 5 * 60 * 60 * 1000
      })
      res.status(200).json(apiResponce(null, "Token generated successfully.."));


    } catch (error) {
      next(error)
    }
  }

  profile = async (req, res, next) => {
    try {
      const userId = req.userid
      const user = await this.authService.profile(userId)
      
      res.status(200).json(
        apiResponce({user}, "User profile fetched successfully!!")
      )
    } catch (error) {
      next(error)
    }
  }

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

      res.status(200).json(apiResponce(null, 'If an account exists, a reset link has been sent.'));
    } catch (error) {
      next(error);
    }
  };

  verifyPasswordToken = async (req, res, next) => {
    try {
      const { token } = req.params;

      await this.authService.verifyPasswordToken(token);

      const baseUrl = process.env.BASE_URL; 
      
      res.status(200).json({
        success: true,
        message: "verified successfully",
        redirect_to_url: `<a href='${baseUrl}/api/auth/change-password/${token}'>`,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { token } = req.params;
      const {password} = req.body
      await this.authService.changePassword(token, password);

      res
        .status(200)
        .json(apiResponce(null, "Password changed successfully!!"));
    } catch (error) {
      next(error);
    }
  };

  userLogout = async (req, res, next) => {
    try {
      res.clearCookie("authToken");
      res.clearCookie("authRefreshToken");
      res.clearCookie("visitedfeedToken");
      res.status(200).json(apiResponce(null, "User logout Successfully"));
    } catch (error) {
      next(error)
    }
  };
}

module.exports = AuthController;
