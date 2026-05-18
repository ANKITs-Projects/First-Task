const apiResponce = require('./../utils/responceObj')

class AdminController {
    constructor(adminService){
        this.adminService = adminService
    }
    
    getAllUsers = async (req, res, next) => {
        try {
            const {cursor} = req.query
            const {users, cursor} = await this.adminService.getAllUsers(cursor)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(200).json(
                apiResponce({users, cursor}, "User fetched successfully")
            )
        } catch (error) {
            next(error)
        }
    }
    

   
    deleteUser = async (req, res, next) => {
        try {
            const {userid} = req.params
            await this.adminService.deleteUser(userid)

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(200).json(
                apiResponce(null, "User deletaed successfully")
                )
        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = AdminController