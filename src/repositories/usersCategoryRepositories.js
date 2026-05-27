const pool = require("../config/pgdb")

async function createNewUsersCategory(userId, category) {
    try {
        const usersCategory = await pool.query(
            `
            INSERT INTO users_category (user_id, category) 
            VALUES ($1, $2) 
            RETURNING *
            `,
            [userId, category]
        )
        return usersCategory.rows[0]
    } catch (error) {
        throw error
    }
}

async function getUsersCategoryByUserId(userId, select) {
    try {
        const usersCategory = await pool.query(
            `
            SELECT ${select} FROM users_category 
            WHERE user_id = $1
            `,
            [userId]
        )
        return usersCategory.rows[0]
    } catch (error) {
        throw error
    }
}

async function updateUsersCategory(userId, category) {
    try {
        const usersCategory = await pool.query(
            `
            UPDATE users_category
            SET category = ARRAY(
                SELECT DISTINCT unnest(
                COALESCE(category, '{}') || $2::text[]
                )
            )
            WHERE user_id = $1
            RETURNING *;
            `,
            [userId, category]
        )
        return usersCategory.rows[0]
    } catch (error) {
        throw error
    }
}



module.exports = {getUsersCategoryByUserId, createNewUsersCategory, updateUsersCategory}