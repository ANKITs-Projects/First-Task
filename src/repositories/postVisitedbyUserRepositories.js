const pool = require("../config/pgdb");


async function createOrUpdatePostVisitedByUser(postid, userid) {
    try {
      const visitedPosts = await pool.query(
        `INSERT INTO post_visited_by_user (user_id, post_id)
          VALUES ($1, $2)
   
          ON CONFLICT (user_id, post_id)
          DO NOTHING
        `,
        [userid, postid],
      );
      return visitedPosts.rows
    } catch (error) {
      throw error;
    }
}

async function getVisitedPostsByUserId(select, userid) {
  try {
    const visitedPosts = await pool.query(
      `
      SELECT ${select}
      FROM post_visited_by_user
      WHERE user_id = $1
      `,
      [userid]
    )
    return visitedPosts.rows
  } catch (error) {
    throw error
  }
}


  module.exports = {createOrUpdatePostVisitedByUser, getVisitedPostsByUserId}