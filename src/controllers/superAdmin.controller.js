class SuperAdminController{
    constructor(superAdminService){
        this.superAdminService = superAdminService
    }

    createAdmin = async (req, res, next) => {
        try {
            const user = await this.superAdminService.createAdmin(req.body)

            res.status(201).json({
                success: true,
                message: "Admin created successfully!",
                user: user
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = SuperAdminController