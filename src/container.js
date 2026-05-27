const AuthServices = require('./services/authService')
const AuthController = require('./controllers/authController')

const AdminServices = require('./services/adminService')
const AdminController = require('./controllers/adminController')

const SuperAdminService = require('./services/superadminService')
const SuperAdminController = require('./controllers/superadminController')

const UserServices = require('./services/userService')
const UserController = require('./controllers/userController')


const authService = new AuthServices()
const authController = new AuthController(authService)

const superAdminService = new SuperAdminService()
const superAdminController = new SuperAdminController(superAdminService)

const adminService = new AdminServices()
const adminController = new AdminController(adminService)

const userService = new UserServices()
const userController = new UserController(userService)




module.exports = {authController, superAdminController, adminController, userController}