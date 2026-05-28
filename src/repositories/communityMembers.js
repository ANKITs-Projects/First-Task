const pool = require("../config/pgdb")


async function getCommunityMemberByUserId(userId, communityId) {
    try {
        const communityMember = await pool.query(
            `
          SELECT * FROM community_members
          WHERE user_id = $1 AND community_id = $2 
          `,
          [userId, communityId]
        )
        return communityMember.rows[0]
    } catch (error) {
        throw error
    }
}

async function getCommunityMember(select, query, values) {
    try {
        const communityMember = await pool.query(
             `
          SELECT ${select} FROM community_members
          WHERE ${query}
          `,
          values
        )
        return communityMember.rows
    } catch (error) {
        throw error
    }
} 

async function makeCommunityMember(fields, valueNotation, values) {
    try {
         const communityMember = await pool.query(
           `
        INSERT INTO community_members (${fields})
        VALUES (${valueNotation})
        RETURNING *
        `,
        values
        )

        return communityMember.rows[0] 
    } catch (error) {
        throw error
    }
}

async function updateCommunityMember(fields, conditions, values) {
    try {
         const communityMember = await pool.query(
           `
        UPDATE community_members 
        SET ${fields}
        WHERE ${conditions}
        RETURNING *
        `,
        values
        )

        return communityMember.rows[0] 
    } catch (error) {
        throw error
    }
}


module.exports = {getCommunityMemberByUserId, makeCommunityMember, getCommunityMember, updateCommunityMember}