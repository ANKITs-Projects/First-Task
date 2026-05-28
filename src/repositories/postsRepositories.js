const pool = require("../config/pgdb")


async function createNewPost(fields, valueNotation, values) {
    try {
        const post = await pool.query(
            `INSERT INTO posts (${fields})
             VALUES(${valueNotation})
            RETURNING *
            `,
            values
        )
        return post.rows[0]
    } catch (error) {
        throw error
    }
}

async function getPostByPostId(id, select) {
    try {
        const post = await pool.query(
            `SELECT ${select}
            FROM posts
            WHERE 
            id = $1
            AND is_delete = false
            `,
            [id]
        )
        return post.rows[0]
    } catch (error) {
        throw error
    }
}

async function getPosts(select, condition, modifier, values) {
    try {
        condition = condition ? `AND ${condition}` : ''

        const post = await pool.query(
            `SELECT ${select}
            FROM posts
            WHERE 
            is_delete = false
            ${condition}
            ${modifier}
            `,
            values
        )
        return post.rows
    } catch (error) {
        throw error
    }
}

async function updatePostRepository(fields, condition, values) {
    try {
        condition = condition ? `AND ${condition}` : ''
        const post = await pool.query(
            `UPDATE posts 
             SET ${fields}
             WHERE
             is_delete = false 
             ${condition}
             RETURNING *`,
            values
        );
        
        return post.rows[0];
    } catch (error) {
        throw error
    }
}

async function searchPost(select, joinCondition, queryCondition, modifier, values) {
    try {
        queryCondition = queryCondition ? `AND ${queryCondition}` : ''
        const post = await pool.query(
            `
            SELECT ${select}
            FROM posts
            ${joinCondition}
            WHERE 
            is_delete = false
            ${queryCondition}
            ${modifier}
            `,
            values
        );
        
        return post.rows;
    } catch (error) {
        throw error
    }
}


module.exports = {createNewPost, getPostByPostId, updatePostRepository, getPosts, searchPost}