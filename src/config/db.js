const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_DB_URI)

const db = mongoose.connection;

db.on('connected', () => {
    console.log("DB Connection Successful")
})

db.on('error', (err) => {
    console.log(`db connection failed : ${err.message}`)
})