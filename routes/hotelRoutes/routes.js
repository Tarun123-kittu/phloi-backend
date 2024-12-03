let express = require('express')
let router = express.Router()
let verifyHotelToken = require("../../middlewares/authentication/hotelAuthmiddleware")
let hotelAuthController = require("../../controllers/hotel/authController")
let hotelDetailsController = require("../../controllers/hotel/hotelDetailsController")
let {
    signUpValidator,
    signInValidator,
    forgetPasswordValidator,
    resetPasswordValidator,
    saveHotelDetailsValidator,
    changePasswordValidator,
    deleteHotelImageValidator
} = require("../../middlewares/validations/hotelValidationMiddleware")



// auth
router.post("/signUp", signUpValidator, hotelAuthController.signUp)
router.post("/signIn", signInValidator, hotelAuthController.signIn)
router.post("/forgetPassword", forgetPasswordValidator, hotelAuthController.forgetPassword)
router.put("/resetPassword", resetPasswordValidator, hotelAuthController.resetPassword)
router.put("/changePassword",verifyHotelToken,changePasswordValidator,hotelAuthController.changePassword)


// hotel onboarding
router.post("/saveHotelDetails", verifyHotelToken, saveHotelDetailsValidator, hotelDetailsController.saveHotelDetails)
router.get("/get_hotel_details",verifyHotelToken,hotelDetailsController.get_hotel_details)
router.put("/update_hotel_details",verifyHotelToken,hotelDetailsController.update_hotel_details)
router.delete("/delete_Hotel_image",verifyHotelToken,deleteHotelImageValidator,hotelDetailsController.delete_Hotel_image)



module.exports = router