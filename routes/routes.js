let express = require('express')
let router = express.Router()
const userController = require("../controllers/userController")
const { 
    user_registration_steps_validator,
    validateLogin,
    validateSocialLogin,
    validateVerifyOtp,
    validateUpdateImagePositions
 } = require("../middlewares/validationMiddleware")
 let authenticateToken= require('../middlewares/authMiddleware')



// user routes
router.put("/user_registration_steps", user_registration_steps_validator, userController.user_registration_steps)
router.get("/get_user_details/:id?", authenticateToken,userController.get_user_details)



//user 
router.post("/login", validateLogin, userController.login)
router.post("/social_login", validateSocialLogin, userController.social_login)
router.post("/verify_otp", validateVerifyOtp, userController.verify_otp)

//update user profile
router.post("/upload",userController.upload)
router.put("/update_image_position",authenticateToken,validateUpdateImagePositions,userController.update_image_position)
router.put("/update_user_profile",authenticateToken,userController.update_user_profile)


module.exports = router