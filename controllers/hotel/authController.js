let hotelModel = require("../../models/hotelModel")
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
const messages = require('../../utils/common/messages')
const { generateHashedPassword, compareHashedPassword, generateToken, generateOtp } = require('../../utils/common/commonFunctions')
const sendEmail = require("../../utils/common/emailSender")



exports.signUp = async (req, res) => {
    try {
        let { username, email, password } = req.body

        let isEmailExist = await hotelModel.findOne({ email: email })
        if (isEmailExist) { return res.status(400).json(errorResponse("This email is already registered.")) }

        let hashedPassword = await generateHashedPassword(password)

        await hotelModel.create({ username, email, password: hashedPassword })

        return res.status(200).json(successResponse("Registration completed!"))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.signIn = async (req, res) => {
    try {
        let { email, password } = req.body

        let isEmailExist = await hotelModel.findOne({ email: email })
        if (!isEmailExist) { return res.status(400).json(errorResponse('This email is not registered')) }

        let passwordCheck = await compareHashedPassword(password, isEmailExist.password)
        if (!passwordCheck) { return res.status(400).json(errorResponse("You are entering incorrect password")) }

        let token = await generateToken(isEmailExist._id)

        return res.status(200).json(successResponse('Login successful', token))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.forgetPassword = async (req, res) => {
    try {
        let email = req.body.email;

        let emailExist = await hotelModel.findOne({ email: email })
        if (!emailExist) { return res.status(400).json(errorResponse('This email is not registered')) }

        let code = generateOtp()

        let date = new Date()
        await hotelModel.findOneAndUpdate({ email: email }, {
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
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}





exports.forgetPasswordVerifyOtp = async (req, res) => {
    try {
        let { email, otp } = req.body


        const isEmailExist = await hotelModel.findOne({ email: email });
        if (!isEmailExist) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, 'hotel not found with the provided email'));
        }


        if (!isEmailExist.forgetPsd_otp) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'OTP has already been used or does not exist'));
        }


        const OTP_EXPIRATION_TIME = 120;
        const createdAt = new Date(isEmailExist.forgetPsd_otpCreatedAt);
        const now = new Date();
        const otpTimeElapsed = Math.abs(now.getTime() - createdAt.getTime()) / 1000;

        if (otpTimeElapsed > OTP_EXPIRATION_TIME) {
            return res.status(400).json(errorResponse('OTP time expired, please resend OTP'));
        }


        if (otp !== isEmailExist.forgetPsd_otp) {
            return res.status(400).json(errorResponse('Incorrect OTP'));
        }


        await hotelModel.findOneAndUpdate(
            { email, forgetPsd_otp: otp },
            {
                $set: {
                    forgetPsd_otpVerified: true,
                    forgetPsd_otp: null,
                    forgetPsd_otpCreatedAt: null,
                },
            }
        );

        return res.status(200).json(successResponse('OTP verified successfully'));
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.resendOtp = async (req, res) => {
    try {
        const email = req.body.email;

        const isEmailExist = await hotelModel.findOne({ email });
        if (!isEmailExist) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, 'Data not found with this email')) }


        const code = generateOtp();
        const currentTime = new Date();
        await hotelModel.findOneAndUpdate(
            { email },
            {
                $set: {
                    forgetPsd_otp: code,
                    forgetPsd_otpCreatedAt: currentTime,
                },
            }
        );


        const emailResponse = await sendEmail(email, code);
        if (emailResponse.success) {
            return res.status(200).json(successResponse('OTP resent successfully'));
        } else {
            return res.status(500).json(errorResponse('Failed to send OTP', emailResponse.error));
        }
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide email")) }
        const user = await hotelModel.findOne({ email });
        if (!user) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong,'Data not found with this email')); }

        if (!user.forgetPsd_otpVerified) { return res.status(400).json(errorResponse('OTP not verified. Cannot reset password.')); }

        const hashedPassword = await generateHashedPassword(password);

        await hotelModel.findOneAndUpdate(
            { email },
            {
                password: hashedPassword,
                forgetPsd_otpVerified: false,
            }
        );


        return res.status(200).json(successResponse("Password changed successfully"));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}