const { validationResult } = require("express-validator");

const apiValidator = async (req, res, next) => {
  try {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      res.status(400).json({
        success: false,
        error: result.array(),
      })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

module.exports = apiValidator;
