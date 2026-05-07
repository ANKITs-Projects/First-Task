require('dotenv').config({path: "./.env"})
const db = require('./src/config/db')
const app = require("./src/app")




const port = process.env.PORT


app.listen(port, () => {
    console.log("Server is running on port: ",port)
})