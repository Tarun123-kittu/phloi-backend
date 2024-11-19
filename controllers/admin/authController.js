let adminModel = require('../../models/adminModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')
let sendEmail = require('../../utils/common/emailSender')
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
    if (!validationResult.isValid) { return res.status(400).json({ error: validationResult.message }) }

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
      return res.status(200).json({ message: emailResponse.message });
    } else {
      return res.status(400).json({ message: emailResponse.message, error: emailResponse.error });
    }


  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
  }
}



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