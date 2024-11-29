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
      subject: 'Forget password verification code',
      text: `Forget password verification code: ${code}`,
      html: `<div style="
      padding: 30px; 
      text-align: center; 
      color: #ffffff; 
      background: linear-gradient(135deg, #007bff, #6610f2); 
      border-radius: 10px; 
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); 
      font-family: Arial, sans-serif;
    ">
  <h1 style="
      margin: 0; 
      font-size: 28px; 
      font-weight: bold;
      text-transform: uppercase;
    ">
    Your Verification Code
  </h1>
  <p style="
      font-size: 24px; 
      margin: 20px 0; 
      font-weight: 500;
      background: #ffffff;
      color: #007bff;
      display: inline-block;
      padding: 10px 20px;
      border-radius: 5px;
      border: 2px solid #007bff;
    ">
    ${code}
  </p>
  <p style="
      font-size: 16px; 
      color: #ffffff;
      margin-top: 20px;
    ">
    Please use the above code to complete your verification process. The code is valid for a 2 minutes.
  </p>
</div>`,

    };

   
    await transporter.sendMail(mailDetails);


    return { success: true, message: "OTP has been sent to your email" };
  } catch (error) {
 
    return { success: false, message: "Something went wrong", error: error.message };
  }
};

module.exports = sendEmail;
