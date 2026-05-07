const { param } = require("express-validator");


const userIdValidation = [
    param("postid").notEmpty().withMessage('UserId is required!')
]

module.exports = {userIdValidation}