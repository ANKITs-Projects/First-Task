const PasswordHashing = require("../utils/passwordHashing");
const createError = require('../utils/errorObjGenerater');
const pool = require("../config/pgdb");
const { getUserByEmail, getUserByUserName, createNewUser } = require("../repositories/usersRepositories");

class SuperAdminService {
    constructor(){}

    async createAdmin(data) {
        try {
            const {name, username, email, password} = data
            
            const select = 'id'

            const admin = await getUserByEmail(email, select)

            if(admin) throw createError("Admin user already exist", 400)
            
            const adminUserName = await getUserByUserName(username)

            if(adminUserName) throw createError('Username already taken', 400)

            const hashedPassword = await PasswordHashing.hashing(password);


            // const newAdmin = await pool.query(
            //     `
            //     INSERT INTO users (name, username, email, password_hash, role) 
            //     VALUES ($1, $2, $3, $4, $5)
            //     RETURNING *    
            //     `,
            //     [name, username, email, hashedPassword, 'admin']               
            // ) 

            const fields = 'name, username, email, password_hash, role'
            const valueNotation = '$1, $2, $3, $4, $5'
            const values = [name, username, email, hashedPassword, 'admin']
      
            const newAdmin = await createNewUser(fields, valueNotation, values)

            return newAdmin

        } catch (error) {
            throw (error);
        }
    }
}

module.exports = SuperAdminService