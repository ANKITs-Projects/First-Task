const PasswordHashing = require("../utils/password.hashing");
const createError = require('../utils/errorObjGenerater');
const pool = require("../config/pgdb");

class SuperAdminService {
    constructor(userModel){
        this.userModel = userModel
    }

    async createAdmin(data) {
        try {
            const {name, username, email, password} = data
            
            const admin = await pool.query(
                `
                SELECT * FROM users 
                WHERE email = $1
                `,
                [email]
            )
            if(admin.rows.length > 0){
                throw createError("Admin user already exist", 400)
            }

            const hashedPassword = await PasswordHashing.hashing(password);

            const newAdmin = await pool.query(
                `
                INSET INTO users (name, username, email, password_hash, role) 
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *    
                `,
                [name, username, email, hashedPassword, 'admin']               
            ) 

            return newAdmin.rows[0]

        } catch (error) {
            throw (error);
        }
    }
}

module.exports = SuperAdminService