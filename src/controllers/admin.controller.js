const apiResponce = require('./../utils/responceObj')

class AdminController {
    constructor(adminService){
        this.adminService = adminService
    }
    
    getAllUsers = async (req, res, next) => {
        try {
            const data = await this.adminService.getAllUsers()

            res.cookie("authToken", req.token, {
                maxAge: 5 * 60 * 60 * 1000
            })
            res.status(200).json(
                apiResponce(data, "User fetched successfully")
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