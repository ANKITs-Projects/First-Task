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
            const data = await this.adminService.deleteUser(userid)

            res.status(200).json(
                apiResponce({data}, "User deletaed successfully")
                )
        } catch (error) {
            next(error)
        }
    }

    getDeletedUser = async (req, res, next) => {
        try {
            const {cursor} = req.query || null
            
            const {users, newCursor} = await this.adminService.getDeletedUser(cursor)

            const message = users.length === 0 ? "No more delete user's data" : "Delete User's data fetched successfully"
            
            res.status(200).json(
                apiResponce({users, cursor: newCursor}, message)
            )
        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = AdminController