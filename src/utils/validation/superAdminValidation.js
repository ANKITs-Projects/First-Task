const { body } = require("express-validator");


const createAdminValidation = [
    body("email").isEmail().withMessage("Please enter a valid email"),,
    body("name").isAlpha().withMessage("Name field must contain only string value.."),,
    body('password').isLength({min: 6}).withMessage("Password must contain minimum 6 character"),
]

module.exports = { createAdminValidation }