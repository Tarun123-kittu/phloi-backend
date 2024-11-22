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
router.post('/add_section',verifyAdminToken,safetyAndPrivacyController.add_section)
router.get('/get_sections',verifyAdminToken,safetyAndPrivacyController.get_sections)
router.get("/get_section_by_id",verifyAdminToken,safetyAndPrivacyController.get_section_by_id)
router.put("/update_section",verifyAdminToken,safetyAndPrivacyController.update_section)
router.delete("/delete_section",verifyAdminToken,safetyAndPrivacyController.delete_section)
router.put("/add_page_to_section",verifyAdminToken,safetyAndPrivacyController.add_page_to_section)
router.delete("/delete_page",verifyAdminToken,safetyAndPrivacyController.delete_page)

module.exports = router