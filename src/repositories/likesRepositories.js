const pool = require("../config/pgdb");

async function toggleLikeRepository(userId, postid) {
    try {
        const like = await pool.query(
        `
        INSERT INTO likes (user_id, post_id)
        VALUES ($1, $2)

        ON CONFLICT (user_id, post_id)
        DO UPDATE SET isliked = NOT likes.isliked

        RETURNING isliked
        `,
        [userId, postid],
      );
      return like.rows[0]
    } catch (error) {
        throw error
    }
}

module.exports = {toggleLikeRepository}