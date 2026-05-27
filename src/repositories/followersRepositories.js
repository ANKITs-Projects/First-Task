const pool = require("../config/pgdb")

async function followRepository(followingId, userId) {
    try {
        const follow = await pool.query(
        `
        INSERT INTO followers (following, follower)
        VALUES ($1, $2)
        ON CONFLICT (following, follower)
        
        DO UPDATE SET isfollowing = NOT followers.isfollowing
        RETURNING * 
        `,
        [followingId, userId]
      )

      return follow.rows[0]
    } catch (error) {
        throw error
    }
}
async function getFollowersRepository(userId) {
    try {
       const follower = await pool.query(
        `
        SELECT * FROM followers
        WHERE following = $1 
        AND isfollowing = $2
        `,
        [userId, true]
      )

      return follower.rows
    } catch (error) {
        throw error
    }
}
async function getFollowingRepository(userId) {
    try {
        const follow = await pool.query(
        `
        SELECT * FROM followers
        WHERE follower = $1 
        AND isfollowing = $2
        `,
        [userId, true]
      )

      return follow.rows
    } catch (error) {
        throw error
    }
}

module.exports = {followRepository, getFollowersRepository, getFollowingRepository}