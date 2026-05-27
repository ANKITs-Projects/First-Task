const pool = require("../config/pgdb");


async function createOrUpdatePostVisitedByUser(postid, userid) {
    try {
      await pool.query(
        `INSERT INTO post_visited_by_user (user_id, post_id)
          VALUES ($1, $2)
   
          ON CONFLICT (user_id, post_id)
          DO NOTHING
        `,
        [userid, postid],
      );
    } catch (error) {
      throw error;
    }
  }

  module.exports = {createOrUpdatePostVisitedByUser}