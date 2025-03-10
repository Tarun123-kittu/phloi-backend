let hotelModel = require("../../models/hotelModel")
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
const messages = require('../../utils/common/messages')
const { generateHashedPassword, compareHashedPassword, generateToken, generateOtp, passwordResetToken } = require('../../utils/common/commonFunctions')
const { sendEmail } = require("../../utils/common/emailSender")
const hotelAccountsModel = require("../../models/hotelAccounts")
const config = require("../../config/config")
const {uploadFile} =require("../../utils/common/awsUpload")



exports.signUp = async (req, res) => {
    try {
        let { username, email, password, phoneNumber } = req.body
        let image = req.files?.image

        // if(!image) {
        //     return res.status(400).json(errorResponse("Please add image"))
        // }


        let isEmailExist = await hotelAccountsModel.findOne({ email: email })
        if (isEmailExist) { return res.status(400).json(errorResponse("This email is already registered.")) }

        let uploadedImage = null
        if(image){
            let imageData = await uploadFile(image, 'Establishment Accounts');
            uploadedImage = imageData.Location
        }

        let hashedPassword = await generateHashedPassword(password)

        await hotelAccountsModel.create({ username, email, password: hashedPassword,image: uploadedImage, phoneNumber:phoneNumber})

        return res.status(200).json(successResponse("Registration completed!"))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.signIn = async (req, res) => {
    try {
        let { email, password } = req.body
        console.log(email, password)

        let isEmailExist = await hotelAccountsModel.findOne({ email: email })

        if (!isEmailExist) { return res.status(400).json(errorResponse('This email is not registered')) }

        let passwordCheck = await compareHashedPassword(password, isEmailExist.password)
        if (!passwordCheck) { return res.status(400).json(errorResponse("You are entering incorrect password")) }

        let token = await generateToken(isEmailExist._id)

        let isOnboradingDone = await hotelModel.findOne({ hotelAccountId: isEmailExist._id })
        var onborading
        if (isOnboradingDone) { onborading = true } else { onborading = false }

        return res.status(200).json({ type: "success", message: "Login successful", data: token, isOnboradingDone: onborading, email: isEmailExist.email, username: isEmailExist.username })
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.forgetPassword = async (req, res) => {
    try {
        let email = req.body.email;

        let emailExist = await hotelAccountsModel.findOne({ email: email })
        if (!emailExist) { return res.status(400).json(errorResponse('This email is not registered')) }

        const resetToken = await passwordResetToken();


        let date = new Date()
        await hotelAccountsModel.findOneAndUpdate({ email: email }, {
            $set: {
                password_reset_token: resetToken,
                forgetPsd_tokenCreatedAt: date,
            }
        })
        const resetUrl = `${config.development.hotel_dashboard_url}reset-password/${resetToken}`;
        const emailResponse = await sendEmail(email, resetUrl);
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



exports.resetPassword = async (req, res) => {
    try {
        const { hashed_token, password } = req.body;

        if (!hashed_token) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide token")) }
        const user = await hotelAccountsModel.findOne({ password_reset_token: hashed_token });
        if (!user) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, 'Data not found with this token ')); }


        const OTP_EXPIRATION_TIME = 120;
        const createdAt = new Date(user.forgetPsd_tokenCreatedAt);
        const now = new Date();
        const otpTimeElapsed = Math.abs(now.getTime() - createdAt.getTime()) / 1000;

        if (otpTimeElapsed > OTP_EXPIRATION_TIME) {
            return res.status(400).json(errorResponse('Password reset time expired, please send send link again'));
        }


        if (hashed_token !== user.password_reset_token) {
            return res.status(400).json(errorResponse('Something went wrong', 'token not matched'));
        }


        const hashedPassword = await generateHashedPassword(password);

        await hotelAccountsModel.findOneAndUpdate(
            { password_reset_token: hashed_token },
            {
                password: hashedPassword,
                password_reset_token: null
            }
        );

        return res.status(200).json(successResponse("Password changed successfully"));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}



exports.changePassword = async (req, res) => {
    try {
        let id = req.result.userId;
        let password = req.body.password;
        let newPassword = req.body.newPassword


        let hotelDetails = await hotelAccountsModel.findOne({ _id: id })
        if (!hotelDetails) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Logged In hotel not found'))
        }
        let isPassCorrect = await compareHashedPassword(password, hotelDetails.password)
        if (!isPassCorrect) {
            return res.status(400).json(errorResponse('Entered current password is not correct'))
        }

        let passhash = await generateHashedPassword(newPassword)
        await hotelAccountsModel.findOneAndUpdate({ _id: id }, {
            $set: {
                password: passhash,
            }
        })
        return res.status(200).json(successResponse("Password changed successfully"))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}


exports.getHotelAccoutDetails = async(req,res)=>{
    try{
       let userId = req.result.userId     
       
       let isUserExist = await hotelAccountsModel.findById(userId).select('username email image phoneNumber')
       if(!isUserExist){
        return res.status(400).json(errorResponse("Establishment account is not exist"))
       }
       return res.status(200).json(successResponse("Details fetched successfully",isUserExist))
    }catch(error){
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}


exports.updateAccount = async (req, res) => {
    try {
        let { username, email, phoneNumber } = req.body;
        let image = req.files?.image;
        let userId = req.result.userId;


        let user = await hotelAccountsModel.findById(userId).select("username email image phoneNumber ");
        if (!user) {
            return res.status(404).json(errorResponse("User not found."));
        }

        
        if (email && email !== user.email) {
            let isEmailExist = await hotelAccountsModel.findOne({ email: email });
            if (isEmailExist) {
                return res.status(400).json(errorResponse("This email is already registered."));
            }
        }

      
        let uploadedImage = user.image; 
        if (image) {
            let imageData = await uploadFile(image, 'Establishment Accounts');
            uploadedImage = imageData.Location;
        }

        
        user.username = username || user.username;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.image = uploadedImage;

        await user.save();

        return res.status(200).json(successResponse("Account updated successfully!", user));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse("Something went wrong.", error.message));
    }
};

