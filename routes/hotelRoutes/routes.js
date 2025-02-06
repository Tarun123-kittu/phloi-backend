let express = require('express')
let router = express.Router()
let verifyHotelToken = require("../../middlewares/authentication/hotelAuthmiddleware")
let hotelAuthController = require("../../controllers/hotel/authController")
let hotelDetailsController = require("../../controllers/hotel/hotelDetailsController")
let paymentController = require("../../controllers/hotel/paymentsController")
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
router.put("/changePassword", verifyHotelToken, changePasswordValidator, hotelAuthController.changePassword)
router.get("/getHotelAccoutDetails", verifyHotelToken, hotelAuthController.getHotelAccoutDetails)
router.put("/updateAccount", verifyHotelToken, hotelAuthController.updateAccount)


// hotel onboarding
router.post("/saveHotelDetails", verifyHotelToken, saveHotelDetailsValidator, hotelDetailsController.saveHotelDetails)
router.get("/get_hotel_details", verifyHotelToken, hotelDetailsController.get_hotel_details)
router.get("/get_hotel_data", verifyHotelToken, hotelDetailsController.get_hotel_data)
router.put("/update_hotel_details", verifyHotelToken, hotelDetailsController.update_hotel_details)
router.delete("/delete_Hotel_image", verifyHotelToken, deleteHotelImageValidator, hotelDetailsController.delete_Hotel_image)
router.get("/get_hotel_notifications", verifyHotelToken, hotelDetailsController.get_hotel_notifications)
router.delete("/delete_my_establishment",verifyHotelToken,hotelDetailsController.delete_my_establishment)



//payments
router.get("/subscribe", paymentController.subscribe)
router.post("/checkout", paymentController.checkout)
router.get("/success", paymentController.success)
router.get("/cancel", paymentController.cancel)
router.put("/delete_subscription", verifyHotelToken, paymentController.delete_subscription)



module.exports = router