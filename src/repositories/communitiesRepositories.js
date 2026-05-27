const pool = require("../config/pgdb")



async function getCommunityById(id, select) {
    try {
        const community = await pool.query(
            `
            SELECT ${select} FROM communities 
            WHERE id = $1
            `,
            [id]
        )

        return community.rows[0]
    } catch (error) {
        throw error
    }
}

module.exports = {getCommunityById}