const nodemailer = require('nodemailer');
const config = require('../../config/config');

const sendEmail = async (email, code) => {
  try {

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.development.gmail,
        pass: config.development.gmail_password,
      },
    });


    let mailDetails = {
      from: config.development.gmail,
      to: email,
      subject: 'Admin forget password verification code',
      text: `Admin forget password verification code: ${code}`,
      html: `<div style="padding:30px; text-align:center; color:black; background-color:blue;">
               <h2>${code}</h2>
             </div>`,
    };

   
    await transporter.sendMail(mailDetails);


    return { success: true, message: "OTP has been sent to your email" };
  } catch (error) {
 
    return { success: false, message: "Something went wrong", error: error.message };
  }
};

module.exports = sendEmail;
