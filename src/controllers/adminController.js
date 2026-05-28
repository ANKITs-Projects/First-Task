const apiResponce = require('../utils/apiResponse')

class AdminController {
    
    constructor(adminService){
        this.adminService = adminService
    }
    
    getAllUsers = async (req, res, next) => {
        try {
            const {cursor} = req.query || null
            
            const {users, newCursor} = await this.adminService.getAllUsers(cursor)

            const message = users.length === 0 ? "No more users" : "User fetched successfully"
            res.status(200).json(
                apiResponce({users, cursor: newCursor}, message)
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