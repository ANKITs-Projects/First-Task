const pool = require("../config/pgdb")

async function createComment(fields, valueNotation, values) {
    try {
        const comment = await pool.query(
        `INSERT INTO comments (${fields})
        VALUES(${valueNotation})
        RETURNING *
        `,
        values
        )
        return comment.rows
    } catch (error) {
        throw error
    }
}

async function getCommentRepository(postId) {
    try {
        const comments = await pool.query(
        `
        WITH RECURSIVE comment_tree AS (
        SELECT
            id,
            post_id,
            user_id,
            parent_comment_id,
            comment,
            created_at,
            0 AS depth,
            ARRAY[id] AS path
        FROM comments
        WHERE
        parent_comment_id IS NULL
          AND post_id = $1

        UNION ALL

              SELECT
                  c.id,
                  c.post_id,
                  c.user_id,
                  c.parent_comment_id,
                  c.comment,
                  c.created_at,
                  ct.depth + 1,
                  ct.path || c.id
              FROM comments c
              JOIN comment_tree ct
                  ON c.parent_comment_id = ct.id
          )

          SELECT
              id,
              user_id,
              parent_comment_id,
              comment,
              created_at,
              depth,
              path
          FROM comment_tree
          ORDER BY path;
        `,
        [postId]
      );
      return comments.rows
    } catch (error) {
        throw error
    }
}

module.exports = {createComment, getCommentRepository}