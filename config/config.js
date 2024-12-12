require('dotenv').config();
const mongoose = require('mongoose');



const development = {
    port:process.env.PORT,
    db_url: process.env.PHLOI_DB_URL||'mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority',
    jwt_secret_key:process.env.JWT_SECRET_KEY,
    twilio_account_sid:process.env.ACCOUNT_SID,
    twilio_auth_token:process.env.AUTH_TOKEN,
    twilio_phone_number:process.env.YOUR_TWILIO_PHONE_NUMBER,
    aws_s3_access_key: process.env.AWS_S3_ACCESS_KEY,
    aws_s3_secret_key: process.env.AWS_S3_SECRET_KEY,
    aws_s3_bucket_name:process.env.AWS_S3_BUCKET_NAME,
    aws_s3_region:process.env.AWS_S3_REGION,
    admin_initial_password:process.env.ADMIN_INITIAL_PASSWORD,
    gmail:process.env.GMAIL,
    gmail_password: process.env.TWO_STEP_VERIFIED_PASSWORD,
    fcm_server_key:process.env.FCM_SERVER_KEY,
    stripe_secret_key:process.env.STRIPE_SECRET_KEY,
    stripe_product_price_id:process.env.PRICE_ID
    
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
