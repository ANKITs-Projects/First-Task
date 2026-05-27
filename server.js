require("dotenv").config({path: './.env'})
const pool = require('./src/config/pgdb')
 
const app = require("./src/app")

const PORT  = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const shutdown = async (signal) => { 
    console.log(`${signal} — shutting down gracefully`); 
    server.close(async () => { 
        await pool.end(); 
        process.exit(0); 
    }); 
}; 
process.on('SIGTERM', () => shutdown('SIGTERM')); 
process.on('SIGINT',  () => shutdown('SIGINT')); 