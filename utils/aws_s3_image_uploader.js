const AWS = require('aws-sdk');
const config = require('../config/config');

// Configure AWS SDK
const s3 = new AWS.S3({
    accessKeyId: config?.development?.aws_s3_access_key,
    secretAccessKey: config?.development?.aws_s3_secret_key,
});

// Function to upload a file to S3
const uploadFile = (file) => {
    // Ensure file has data
    if (!file.data) {
        throw new Error('File data is missing.');
    }

    const params = {
        Bucket: 'phloii', // Your S3 bucket name
        Key: 'profile-images/' + file.name, // Key for the file in S3
        Body: file.data, // File data
        ContentType: file.mimetype // MIME type of the file
    };

    return s3.upload(params).promise(); // Use promises to handle async operations
};

module.exports = uploadFile;
