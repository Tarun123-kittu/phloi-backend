const AWS = require('aws-sdk');
const config = require('../config/config');


const s3 = new AWS.S3({
    accessKeyId: config?.development?.aws_s3_access_key,
    secretAccessKey: config?.development?.aws_s3_secret_key,
});


const uploadFile = (file) => {
   
    if (!file.data) {
        throw new Error('File data is missing.');
    }

    const params = {
        Bucket: 'phloii', 
        Key: 'profile-images/' + file.name, 
        Body: file.data, 
        ContentType: file.mimetype 
    };

    return s3.upload(params).promise(); 
};

module.exports = uploadFile;
