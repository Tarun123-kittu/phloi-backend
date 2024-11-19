let jwt = require('jsonwebtoken')
let config = require('../../config/config')
let otpGenerator = require('otp-generator');
let twilio = require('twilio')
let client = new twilio(config.development.twilio_account_sid, config.development.twilio_auth_token)
let bcrypt = require('bcrypt')



const generateToken = (userId, username, email) => {
    return new Promise((resolve, reject) => {
        const payload = { userId: userId, username: username, email: email };
        jwt.sign(payload, config.development.jwt_secret_key, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
};





const generateOtp = () => {
    try {
        const otp = otpGenerator.generate(4, {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        return otp;
    } catch (error) {
        console.error('Error generating OTP:', error);
        throw new Error('Unable to generate OTP');
    }
};



const sendTwilioSms = async (msg,mobile_number) => {
    try {
        const message = await client.messages.create({
            body: msg,
            from: config.development.twilio_phone_number,
            to: mobile_number,
        });
        return { success: true, message };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error };
    }
};



const generateHashedPassword = async (password) => {
    try {
        let salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Unable to generate hashed password');
    }
}


const compareHashedPassword = async (password, userActualPassword) => {
    try {
        const hashedPassword = await bcrypt.compareSync(password, userActualPassword);
        return hashedPassword
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Unable to generate hashed password');
    }
}



const validateEmail = (email) => {
    const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email) {
        return { isValid: false, message: 'Enter your registered email' };
    }
    if (!emailFormat.test(email)) {
        return { isValid: false, message: 'Enter correct email format' };
    }
    return { isValid: true };
};



module.exports = {
    generateToken,
    generateOtp,
    sendTwilioSms,
    generateHashedPassword,
    compareHashedPassword,
    validateEmail
}