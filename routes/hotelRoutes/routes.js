let express = require('express')
let router = express.Router()
let verifyHotelToken = require("../../middlewares/authentication/hotelAuthmiddleware")
let hotelController = require("../../controllers/hotel/authController")
let {
    signUpValidator
} = require("../../middlewares/validations/hotelValidationMiddleware")



// auth
router.post("/signUp", signUpValidator, hotelController.signUp)


module.exports = router