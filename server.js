// require('dotenv').config({path: "./.env"})
// const db = require('./src/config/db')
// const app = require("./src/app")




// const port = process.env.PORT


// app.listen(port, () => {
//     console.log("Server is running on port: ",port)
// })



require("dotenv").config({path: './.env'})

const connectDB = require('./src/config/dbConfig')


const app = require("./src/app")

let isDBConnected = false;

module.exports = async (req, res) => {
    try {
        if (!isDBConnected) {
            console.log("Connecting to DB...");
            await connectDB();
            isDBConnected = true;
            console.log("DB connected");
        }

        return app(req, res);

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

connectDB();

const port  = process.env.PORT || 8000

app.listen(port, () => {
    console.log(`Server is started at PORT: ${port}`)
})

// module.exports = app;

