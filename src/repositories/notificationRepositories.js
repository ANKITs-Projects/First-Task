const pool = require("../config/pgdb")

async function createnotification(fields, valueNotation, values) {
    try {
         const notification = await pool.query(
           `
          INSERT INTO notification (${fields})
          VALUES (${valueNotation})
          RETURNING *;
          `,
          values
        )

        return notification.rows
    } catch (error) {
        throw error
    }
}

async function getAllNotification(select, query, modifier, values) {
    try {
         const notification = await pool.query(
            `
            SELECT ${select} FROM notification
            WHERE ${query}
            ${modifier}    
            `,
            values
            )

        return notification.rows
    } catch (error) {
        throw error
    }
}

module.exports = {createnotification, getAllNotification}