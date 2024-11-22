let express = require('express')
let router = express.Router()
let verifyAdminToken = require("../../middlewares/adminAuthmiddleware")
let adminAuthController = require('../../controllers/admin/authController')
let adminUserController = require('../../controllers/admin/usersController')
let safetyAndPrivacyController = require("../../controllers/admin/safteyAndPrivacyController")


// auth
router.post('/admin_login',adminAuthController.admin_login)
router.put('/forget_password',adminAuthController.forget_password)
router.put('/forgetPassword_verifyOtp',adminAuthController.forgetPassword_verifyOtp)
router.put("/resend_otp",adminAuthController.resend_otp)
router.put("/reset_password",adminAuthController.reset_password)
router.put('/change_password',verifyAdminToken,adminAuthController.change_password)



// users
router.get("/get_all_users",verifyAdminToken,adminUserController.get_all_users)
router.get("/get_profile_verification_requests",verifyAdminToken,adminUserController.get_profile_verification_requests)
router.get('/user_Details',verifyAdminToken,adminUserController.user_Details)
router.put('/approve_or_reject_verification',verifyAdminToken,adminUserController.approve_or_reject_verification)


//safety and privacy
router.post('/addSection',verifyAdminToken,safetyAndPrivacyController.addSection)

module.exports = router