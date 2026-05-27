const {body, query, param} = require('express-validator')


const getFeedsValidation = [
    query('page').optional().isNumeric().withMessage("Page query must be a number")
]

const commentsValidation = [
    body('comment').notEmpty().withMessage('MediaUrl must be an array and max length will be 5.')
]

const postIdValidation = [
    param("postid").notEmpty().withMessage('PostId is required!')
]
const userIdValidation = [
    param("userid").notEmpty().withMessage('UserId is required!')
]


module.exports = { commentsValidation, getFeedsValidation, postIdValidation, userIdValidation}