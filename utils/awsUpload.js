const AWS = require('aws-sdk');
const config = require('../config/config');
const moment = require('moment-timezone');

const s3 = new AWS.S3({
    accessKeyId: config?.development?.aws_s3_access_key,
    secretAccessKey: config?.development?.aws_s3_secret_key,
});

const uploadFile = async (file) => {
    if (!file || !file.data) {
        throw new Error('File data is missing.');
    }

    const current_time = moment().tz('Asia/Kolkata').format('YYYYMMDD_HHmmss');
    const userId = file.userId; 


    const key = `profile_images/${userId}/${current_time}`;

    try {
        const result = await s3.upload({
            Bucket: 'phloii',
            Key: key,
            Body: file.data,
            ContentType: file.mimetype,
        }).promise();

        
        return result;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Error uploading image: ${error.message}`);
    }
};

module.exports = { uploadFile, s3 };
