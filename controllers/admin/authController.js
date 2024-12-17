let adminModel = require('../../models/adminModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')
let { sendEmail } = require('../../utils/common/emailSender')
let {
  compareHashedPassword,
  generateToken,
  generateHashedPassword,
  generateOtp,
  validateEmail } = require("../../utils/common/commonFunctions")




exports.admin_login = async (req, res) => {
  try {
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password
    let isAdminExist

    if (!username && !email) {
      return res.status(400).json(errorResponse('Please provide either username or password'))
    }
    if (username && email) {
      return res.status(400).json(errorResponse('You can only add one:  username or email'))
    }
    if (!password) {
      return res.status(400).json(errorResponse('Please provide your password'))
    }

    if (username) {
      isAdminExist = await adminModel.findOne({ username: username })
    } else {
      isAdminExist = await adminModel.findOne({ email: email })
    }

    if (!isAdminExist) {
      return res.status(400).json(errorResponse("Admin not exist"))
    }

    let comparePassword = await compareHashedPassword(password, isAdminExist.password)
    if (!comparePassword) {
      return res.status(400).json(errorResponse("Incorrect password", 'Entered password is incorrect'))
    }
    let token = await generateToken(isAdminExist._id, isAdminExist.username, isAdminExist.email)

    let userObj = {
      username: isAdminExist.username,
      email: isAdminExist.email,
      token: token
    }

    return res.status(200).json(successResponse('Login successful', userObj))

  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
}




exports.forget_password = async (req, res) => {
  try {
    let email = req.body.email;

    const validationResult = validateEmail(email);
    if (!validationResult.isValid) { return res.status(400).json(errorResponse(validationResult.message)) }

    let emailExist = await adminModel.findOne({ email: email })
    if (!emailExist) { return res.status(400).json(errorResponse('This email is not registered')) }

    let code = generateOtp()

    let date = new Date()
    await adminModel.findOneAndUpdate({ email: email }, {
      $set: {
        forgetPsd_otp: code,
        forgetPsd_otpCreatedAt: date,
      }
    })


    const emailResponse = await sendEmail(email, code);

    if (emailResponse.success) {
      return res.status(200).json(successResponse(emailResponse.message));
    } else {
      return res.status(400).json(errorResponse(emailResponse.message, emailResponse.error));
    }


  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
}






// exports.forgetPassword_verifyOtp = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const otp = req.body.otp;


//     if (!email) {
//       return res.status(400).json(errorResponse('Email is required'));
//     }
//     if (!otp) {
//       return res.status(400).json(errorResponse('Enter OTP'));
//     }


//     const isEmailExist = await adminModel.findOne({ email: email });
//     if (!isEmailExist) {
//       return res.status(404).json(errorResponse('User not found'));
//     }


//     if (!isEmailExist.forgetPsd_otp) {
//       return res.status(400).json(errorResponse('OTP has already been used or does not exist'));
//     }


//     const OTP_EXPIRATION_TIME = 120;
//     const createdAt = new Date(isEmailExist.forgetPsd_otpCreatedAt);
//     const now = new Date();
//     const otpTimeElapsed = Math.abs(now.getTime() - createdAt.getTime()) / 1000;

//     if (otpTimeElapsed > OTP_EXPIRATION_TIME) {
//       return res.status(400).json(errorResponse('OTP time expired, please resend OTP'));
//     }


//     if (otp !== isEmailExist.forgetPsd_otp) {
//       return res.status(400).json(errorResponse('Incorrect OTP'));
//     }


//     await adminModel.findOneAndUpdate(
//       { email, forgetPsd_otp: otp },
//       {
//         $set: {
//           forgetPsd_otpVerified: true,
//           forgetPsd_otp: null,
//           forgetPsd_otpCreatedAt: null,
//         },
//       }
//     );

//     return res.status(200).json(successResponse('OTP verified successfully'));
//   } catch (error) {
//     console.error("ERROR::", error);
//     return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
//   }
// };




// exports.resend_otp = async (req, res) => {
//   try {
//     const email = req.body.email;
//     if (!email) { return res.status(400).json(errorResponse('Email is required')) }


//     const user = await adminModel.findOne({ email });
//     if (!user) { return res.status(404).json(errorResponse('User not found')) }


//     const code = await generateOtp();
//     const currentTime = new Date();
//     await adminModel.findOneAndUpdate(
//       { email },
//       {
//         $set: {
//           forgetPsd_otp: code,
//           forgetPsd_otpCreatedAt: currentTime,
//         },
//       }
//     );


//     const emailResponse = await sendEmail(email, code);
//     if (emailResponse.success) {
//       return res.status(200).json(successResponse('OTP resent successfully'));
//     } else {
//       return res.status(500).json(errorResponse('Failed to send OTP', emailResponse.error));
//     }
//   } catch (error) {
//     console.error('ERROR::', error);
//     return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
//   }
// };






exports.reset_password = async (req, res) => {
  try {
    const { otp, password, confirmPassword } = req.body;

    if (!otp) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Otp is required')) }

    if (!password) { return res.status(400).json(errorResponse('Password is required')) }

    if (!confirmPassword) { return res.status(400).json(errorResponse('Confirm password is required')) }

    if (password !== confirmPassword) { return res.status(400).json(errorResponse('Passwords do not match')) }


    const user = await adminModel.findOne({ forgetPsd_otp: otp });
    if (!user) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, 'Otp changed to null or not created')); }

    const OTP_EXPIRATION_TIME = 120;
    const createdAt = new Date(user.forgetPsd_otpCreatedAt);
    const now = new Date();
    const otpTimeElapsed = Math.abs(now.getTime() - createdAt.getTime()) / 1000;

    if (otpTimeElapsed > OTP_EXPIRATION_TIME) {
      return res.status(400).json(errorResponse('Link expired, please repeat the step of forget password'));
    }


    if (otp !== user.forgetPsd_otp) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,'Incorrect OTP'));
    }

    const hashedPassword = await generateHashedPassword(password);

    await adminModel.findOneAndUpdate(
      { forgetPsd_otp: otp },
      {
        password: hashedPassword,
        forgetPsd_otpVerified: false,
        forgetPsd_otp: null,
        forgetPsd_otpCreatedAt:null
      }
    );


    return res.status(200).json(successResponse("Password changed successfully"));

  } catch (error) {
    console.error('ERROR::', error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
};







exports.change_password = async (req, res) => {
  try {
    let id = req.result.userId;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    let newPassword = req.body.newPassword
    if (!password) {
      return res.status(400).json(errorResponse('Please enter password'))
    }
    if (!newPassword) {
      return res.status(400).json(errorResponse('Enter new password'))
    }
    if (!confirmPassword) {
      return res.status(400).json(errorResponse('Please enter confirm password'))
    }

    let adminDetails = await adminModel.findOne({ _id: id })
    if (!adminDetails) {
      return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Logged In admin not found'))
    }
    let isPassCorrect = await compareHashedPassword(password, adminDetails.password)
    if (!isPassCorrect) {
      return res.status(400).json(errorResponse('Entered current password is not correct'))
    }

    if (!(newPassword === confirmPassword)) {
      return res.status(400).json(errorResponse('Confirm password do not match with new password'))
    }
    if (newPassword.length < 6) {
      return res.status(400).json(errorResponse('Password length must be above six.'))
    }
    let passhash = await generateHashedPassword(newPassword)
    await adminModel.findOneAndUpdate({ _id: id }, {
      $set: {
        password: passhash,
      }
    })
    return res.status(200).json(successResponse("Password changed successfully"))
  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
}