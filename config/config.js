require('dotenv').config();
const mongoose = require('mongoose');

const development = {
    db_url: process.env.PHLOI_DB_URL,
};

if (!development.db_url) {
    throw new Error("Database URL is not defined in the environment variables");
}

const phloi_db_connection = async () => {
    try {
        await mongoose.connect(development.db_url);
        console.log("Connected to mongoose successfully");
    } catch (error) {
        console.error("Error connecting to mongoose:", error.message);
    }
};

module.exports = { phloi_db_connection, development };
