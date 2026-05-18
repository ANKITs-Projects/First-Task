const apiResponce = require('./../utils/responceObj')

class SuperAdminController{
    constructor(superAdminService){
        this.superAdminService = superAdminService
    }

    createAdmin = async (req, res, next) => {
        try {
            const admin = await this.superAdminService.createAdmin(req.body)

            res.status(201).json(
                apiResponce({admin}, "Admin created successfully!")
            )
        } catch (error) {
            next(error)
        }
    }
}

module.exports = SuperAdminController