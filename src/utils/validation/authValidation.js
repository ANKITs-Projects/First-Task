const { body } = require('express-validator')


const signupValidation = [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("name").isAlpha('en-US', {ignore: " "}).withMessage("Name field must contain only string value.."),
    body("username").trim().notEmpty().isLength({ min: 3 }).withMessage('Username must have minimum 3 characters').isAlphanumeric().withMessage('Username must contain only letters and numbers'),
    body('password').isLength({min: 6}).withMessage("Password must contain minimum 6 character"),
]

const loginValidation = [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body('password').notEmpty().withMessage("Please enter the password"),
]

module.exports = {signupValidation, loginValidation}