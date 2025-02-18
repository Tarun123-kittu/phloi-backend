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
      from: '"Phloii" <phloiimanagement@gmail.com>',
      to: email,
      subject: 'Forget password verification ',
      text: `We've received a request to reset your password.`,
      html: `<div style="
      padding: 30px; 
      text-align: center; 
      color: #333333; 
      background: linear-gradient(135deg, #f0f4f8, #e2e8f0); 
      border-radius: 10px; 
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
      font-family: Arial, sans-serif;
    ">
  <h1 style="
      margin: 0; 
      font-size: 28px; 
      font-weight: bold;
      color: #333333;
      text-transform: uppercase;
    ">
    Please Complete Verification 
  </h1>
  <a href="${code}" style="
      font-size: 18px; 
      margin: 20px 0; 
      font-weight: 500;
      background: #ffffff;
      color: #007bff;
      display: inline-block;
      padding: 10px 20px;
      border-radius: 5px;
      border: 2px solid #007bff;
      text-decoration: none;
      text-transform: uppercase;
      transition: background-color 0.3s, color 0.3s;
    " onmouseover="this.style.backgroundColor='#007bff'; this.style.color='#ffffff';" onmouseout="this.style.backgroundColor='#ffffff'; this.style.color='#007bff';">
    Click Me
  </a>
  <p style="
      font-size: 16px; 
      color: #666666;
      margin-top: 20px;
    ">
    Please click the button above to complete your verification process and reset your password. The link is valid for 2 minutes.
  </p>
</div>
`,

    };


    await transporter.sendMail(mailDetails);


    return { success: true, message: "Link has been sent to your email" };
  } catch (error) {

    return { success: false, message: "Something went wrong", error: error.message };
  }
};


const sendHotelVerificationEmail = async (email, status,hotelName,paymentStatus,hotelId,rejectionReason) => {

  try {
 console.log("payment status ----",paymentStatus,email)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.development.gmail,
        pass: config.development.gmail_password,
      },
    });


    let mailDetails = {
      from: `"Phloii" ${config.development.gmail} `,
      to: email,
      subject: 'Regarding Establishment verification ',
      text: `We've received a request to reset your password.`,
      html: `<div style="
      padding: 30px; 
      text-align: center; 
      color: #333333; 
      background: linear-gradient(135deg, #f9fafb, #e5e7eb); 
      border-radius: 10px; 
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
      font-family: Arial, sans-serif;
    ">
  <h1 style="
      margin: 0; 
      font-size: 28px; 
      font-weight: bold;
      color: #333333;
    ">
    Establishment Verification Status
  </h1>

  <p style="
      font-size: 16px; 
      color: #666666;
      line-height: 1.5;
      margin: 20px 0;
    ">
    We are pleased to inform you that your establishment verification request for "<strong>${hotelName}</strong>".
  </p>
  <div style="
      font-size: 20px; 
      font-weight: bold;
      color: ${status ? '#28a745' : '#dc3545'};
      margin: 20px 0;
    ">
    Your request has been <strong>${status ? 'ACCEPTED' : 'REJECTED'}</strong>.
  </div>
  <p style="
      font-size: 16px; 
      color: #666666;
      margin: 20px 0;
    ">
    ${status ? 
      // `Congratulations! Your establishment has been successfully verified and is now approved on our platform. ${paymentStatus == 'pending'?`Please proceed with the payment by clicking <a href="${config.development.stripe_return_url}api/v1/hotel/subscribe?hotelId=${hotelId}">here</a> to show on Phloii.`:'' }` :
      `Congratulations! Your establishment has been successfully verified and is now approved on our platform.` : 
      `We regret to inform you that your request has been rejected. Due to ${rejectionReason} For further details, please contact our support team.`}
  </p>
  <p style="
      font-size: 16px; 
      color: #666666;
      margin-top: 20px;
    ">
    Thank you,<br> The Phloi Team
  </p>
</div>
`,
    };
    await transporter.sendMail(mailDetails);

 
    return { success: true, message: "Link has been sent to your email" };
  } catch (error) {
       
    return { success: false, message: "Something went wrong", error: error.message };
  }
};


module.exports = { sendEmail, sendHotelVerificationEmail }
