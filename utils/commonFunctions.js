let jwt = require('jsonwebtoken')
let config = require('../config/config')
require("dotenv").config()
let  otpGenerator = require('otp-generator');
let twilio = require('twilio')
let client = new twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)



const generateToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = { userId: userId };
        jwt.sign(payload, config.development.jwt_secret_key,(err, token) => {
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



  const sendTwilioSms = async (mobile_number, otp) => {
    try {
        const message = await client.messages.create({
            body: 'Your phloii verification code is ' + otp,
            from: process.env.YOUR_TWILIO_PHONE_NUMBER, 
            to: mobile_number,
        });
        return { success: true, message };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error };
    }
};




module.exports = {
    generateToken,
    generateOtp,
    sendTwilioSms
}