require("dotenv").config({path: './.env'})
const {pool} = require('./src/config/pgdb')
 
const app = require("./src/app")

const PORT  = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


