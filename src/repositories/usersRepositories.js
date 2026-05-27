const pool = require("../config/pgdb")

async function getUserByEmail(email, select) {
    try {
        const user = await pool.query(
            `
            SELECT ${select} FROM users
            WHERE email = $1
            `,
            [email]
        )  
        return user.rows[0]     
    } catch (error) {
        throw error
    }
}

async function getUserByUserName(userName) {
    try {
        const user = await pool.query(
            `
            SELECT id FROM users
            WHERE username = $1
            `,
            [userName]
        )  
        return user.rows[0]    
    } catch (error) {
        throw error
    }
}

async function getUserByUserId(id, select) {
    try {
        const user = await pool.query(
            `
            SELECT ${select}
            FROM users
            WHERE id = $1
            `,
            [id]
        )  
        return user.rows[0]    
    } catch (error) {
        throw error
    }
}

async function getUsers(select, query, values) {
    try {
        const user = await pool.query(
            `
            SELECT ${select}
            FROM users
            ${query}
            `,
            values
        )  
        return user.rows 
    } catch (error) {
        throw error
    }
}

async function createNewUser(fields, valueNotation, values) {
    try {
        const user = await pool.query(
            `
            INSERT INTO users (${fields})
            VALUES (${valueNotation})
            RETURNING id, username, email
            `,
            values
        )  
        return user.rows[0]    
    } catch (error) {
        throw error
    }
}

async function updateUser(query, values) {
    try {
        const responce =  await pool.query(query, values)

        return responce.rows
    } catch (error) {
        throw error
    }
}

async function deleteUserQuery(id) {
    try {
        const responce =  await pool.query(
        `
        DELETE FROM users WHERE id = $1;
        `
        , [id])

        return responce.rows
    } catch (error) {
        throw error
    }
}



module.exports = {getUserByEmail, getUserByUserName, createNewUser, updateUser, getUserByUserId, getUsers, deleteUserQuery}