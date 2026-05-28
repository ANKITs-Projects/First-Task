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

async function getCommunity(select, query, values, modifier = 'ORDER BY communities.created_at DESC') {
    try {
        const community = await pool.query(
            `
            SELECT ${select} FROM communities 
            WHERE ${query}
            ${modifier}
            `,
            values
        )
        return community.rows
    } catch (error) {
        throw error
    }
}

async function createCommunityRepostory(fields, valueNotation, values) {
    try {
        const community = await pool.query(
            `
            INSERT INTO communities (${fields})
            VALUES (${valueNotation})
            RETURNING *
            `,
            values
        )
        return community.rows[0]
    } catch (error) {
        throw error
    }
}

async function updateCommunity(fields, query, values) {
    try {
        const community = await pool.query(
            `
          UPDATE communities 
          SET ${fields}
          WHERE ${query}
          `,
        values
        )
    } catch (error) {
        throw error
    }
}

module.exports = {getCommunityById, getCommunity, createCommunityRepostory, updateCommunity }