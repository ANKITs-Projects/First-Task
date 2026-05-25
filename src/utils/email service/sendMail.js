const createError = require('../errorObjGenerater')
const transporter = require('./transporter')

const sendmail = async(email, html) => {
    try {
        await transporter.sendMail({
         from: process.env.EMAIL,
         to: email,
         subject: "Email from social-app",
         html
      })
    } catch (error) {
        throw createError("Email sending error", 500)
    }
}

module.exports = sendmail