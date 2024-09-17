let express = require('express')
let router = express.Router()
const userController = require("../controllers/userController")
const { get_user_detail_validator, user_registration_steps_validator } = require("../middlewares/validationMiddleware")

// user routes
router.put("/user_registration_steps", user_registration_steps_validator, userController.user_registration_steps)
router.get("/get_user_details/:id?", get_user_detail_validator, userController.get_user_details)



//user 
router.post("/login",userController.login)
router.post("/social_login",userController.social_login)
router.post("/verify_otp",userController.verify_otp)


module.exports = router