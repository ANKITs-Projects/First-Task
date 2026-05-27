const pool = require("../config/pgdb");

async function updateOrCreateUsersFeedCategory(userid, category) {
    try {
        const usersFeedCategory = await pool.query(
                `INSERT INTO users_feed_category (user_id, feed_category)
                  VALUES ($1, $2::text[])
           
                  ON CONFLICT (user_id)
                  DO UPDATE SET feed_category = ARRAY(
                      SELECT DISTINCT unnest(
                        COALESCE(users_feed_category.feed_category, '{}')
                        || EXCLUDED.feed_category
                      )
                  )
                  
                  RETURNING *
                `,
                [userid, category],
              );
        return usersFeedCategory.rows[0]
    } catch (error) {
        throw error
    }
}

module.exports = {updateOrCreateUsersFeedCategory}