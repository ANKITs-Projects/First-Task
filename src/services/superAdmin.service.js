const PasswordHashing = require("../utils/password.hashing");
const createError = require('../utils/errorObjGenerater')

class SuperAdminService {
    constructor(userModel){
        this.userModel = userModel
    }

    async createAdmin(data) {
        try {
            const {name, email, password} = data
            const admin = await this.userModel.findOne({email: email})

            if(admin){
                throw createError("Admin user already exist", 400)
            }

            const hashedPassword = await PasswordHashing.hashing(password);

            const newAdmin = await this.userModel.create({
                name: name,
                email: email,
                password: hashedPassword,
                role: "Admin"
            }) 

            return newAdmin

        } catch (error) {
            throw (error);
        }
    }
}

module.exports = SuperAdminService