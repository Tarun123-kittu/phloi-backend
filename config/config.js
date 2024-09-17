require('dotenv').config();
const mongoose = require('mongoose');

const development = {
    db_url: process.env.PHLOI_DB_URL||'mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority',
    jwt_secret_key:process.env.JWT_SECRET_KEY,
  
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
