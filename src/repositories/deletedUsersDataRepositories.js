const pool = require("../config/pgdb")


async function saveDeleteduserData(userData) {
    try {
        const userDeletedData = await pool.query(
                `
                INSERT INTO deleted_users (user_data)
                VALUES($1)
                RETURNING *
                `,
                [userData]
              )
        return userDeletedData.rows[0]
    } catch (error) {
        throw error
    }
}

async function getDeleteduserData(select, query, values, modifier = 'ORDER BY created_at DESC') {
    try {
        const userDeletedData = await pool.query(
                `
                SELECT ${select} 
                FROM deleted_users 
                WHERE
                ${query}
                ${modifier}
                `,
                values
              )
        return userDeletedData.rows
    } catch (error) {
        throw error
    }
}

module.exports = {saveDeleteduserData, getDeleteduserData}