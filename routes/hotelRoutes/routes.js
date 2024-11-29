let express = require('express')
let router = express.Router()
let verifyHotelToken = require("../../middlewares/authentication/hotelAuthmiddleware")
let hotelController = require("../../controllers/hotel/authController")
let {
    signUpValidator,
    signInValidator,
    forgetPasswordValidator,
    verifyOtpValidator,
    resetPasswordValidator
} = require("../../middlewares/validations/hotelValidationMiddleware")



// auth
router.post("/signUp", signUpValidator, hotelController.signUp)
router.post("/signIn", signInValidator, hotelController.signIn)
router.post("/forgetPassword", forgetPasswordValidator, hotelController.forgetPassword)
router.post("/forgetPasswordVerifyOtp", verifyOtpValidator, hotelController.forgetPasswordVerifyOtp)
router.post("/resendOtp", forgetPasswordValidator, hotelController.resendOtp)
router.put("/resetPassword",resetPasswordValidator,hotelController.resetPassword)


module.exports = router