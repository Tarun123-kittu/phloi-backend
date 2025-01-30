const AWS = require('aws-sdk');
const config = require('../../config/config');
const moment = require('moment-timezone');
const { generateOtp } = require('./commonFunctions')


const s3 = new AWS.S3({
    accessKeyId: config?.development?.aws_s3_access_key,
    secretAccessKey: config?.development?.aws_s3_secret_key,
});

const uploadFile = async (file, data = null) => {


    if (!file || !file.data) {
        throw new Error('File data is missing.');
    }

    const current_time = moment().tz('Asia/Kolkata').format('YYYYMMDD_HHmmss');
    const userId = file.userId;
    const filename = file.name

    let key


    if (data == 'Secret Dating') {
        key = `${data}/profile_images/${userId}/${filename}`
    }

    if( data == 'Secret dating avatar'){
          key = `Secret Dating/avatar/${userId}/${filename}`
    }

    if (data == 'Chat') {
        let chatId = file.chatId
        key = `Chat/${chatId}/${userId}/${current_time}`;
    }

    if (data == 'Profile image') {
        let code = generateOtp()
        key = `profile_images/${userId}/${code}`;
    }

    if (data == 'Reasons Icon') {
        key = `${data}/delete_reasons/${userId}/${filename}`
    }

    if (data == 'Verification Selfies') {
        key = `${data}/${userId}/${current_time}`
    }

    if (data == 'Explore Rooms') {
        key = `${data}/${current_time}`
    }

    if (data == 'Hotels') {
        let code = generateOtp()
        key = `${data}/${file.establishmentType}/${file.establishmentName}/${filename + code}`
    }

    if(data=='Establishment Accounts'){
         key = `${data}/${current_time}`
    }

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






const deleteFileFromAWS = async (fileUrl) => {
    try {
        if (!fileUrl) {
            throw new Error('File URL is missing.');
        }


        const bucketUrl = `https://${config.development.aws_s3_bucket_name}.s3.${config.development.aws_s3_region}.amazonaws.com/`;
        const fileKey = fileUrl.replace(bucketUrl, '');

        if (!fileKey) {
            throw new Error('Unable to extract file key from URL.');
        }


        const result = await s3
            .deleteObject({
                Bucket: 'phloii',
                Key: fileKey,
            })
            .promise();

        console.log('File deleted successfully:', fileKey);
        return result;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error(`Error deleting file from AWS: ${error.message}`);
    }
};



module.exports = { uploadFile, s3, deleteFileFromAWS };
