const pool = require("../config/pgdb")


async function getCommunityMemberByUserId(userId, community_id) {
    try {
        const communityMember = await pool.query(
            `
          SELECT * FROM community_members
          WHERE user_id = $1 AND community_id = $2 
          `,
          [userId, community_id]
        )
        return communityMember.rows[0]
    } catch (error) {
        throw error
    }
} 


module.exports = {getCommunityMemberByUserId}