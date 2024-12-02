let express = require('express')
let router = express.Router()
let verifyHotelToken = require("../../middlewares/authentication/hotelAuthmiddleware")
let hotelController = require("../../controllers/hotel/authController")
let hotelDetailsController = require("../../controllers/hotel/hotelDetailsController")
let {
    signUpValidator,
    signInValidator,
    forgetPasswordValidator,
    resetPasswordValidator,
    saveHotelDetailsValidator
} = require("../../middlewares/validations/hotelValidationMiddleware")



// auth
router.post("/signUp", signUpValidator, hotelController.signUp)
router.post("/signIn", signInValidator, hotelController.signIn)
router.post("/forgetPassword", forgetPasswordValidator, hotelController.forgetPassword)
router.put("/resetPassword", resetPasswordValidator, hotelController.resetPassword)

// hotel onboarding
router.post("/saveHotelDetails", verifyHotelToken, saveHotelDetailsValidator, hotelDetailsController.saveHotelDetails)
router.get("/get_hotel_details",verifyHotelToken,hotelDetailsController.get_hotel_details)


module.exports = router