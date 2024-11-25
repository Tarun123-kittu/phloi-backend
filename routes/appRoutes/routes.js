let express = require('express')
let router = express.Router()
const userController = require("../../controllers/regularDating/userController")
const matchMakingController = require("../../controllers/regularDating/homepageController")
const chatController = require("../../controllers/regularDating/chatController")
const exploreRoomsController = require("../../controllers/regularDating/exploreRoomsController")
const secretDatingUserController = require("../../controllers/sercretDating/secretDatingUserControllers")
const notificationController = require("../../controllers/common/notificationController")
const settingsController = require("../../controllers/common/settingController")
const secretDatingHomepageController = require("../../controllers/sercretDating/secretDatingHomepageController")
const secretDatingChatController = require('../../controllers/sercretDating/secretDatingChatController')
const safetyAndPrivacyController = require('../../controllers/common/safetyAndPrivacyController')
const {
    validateLogin,
    validateSocialLogin,
    validateVerifyOtp,
    validateUpdateImagePositions
} = require("../../middlewares/validationMiddleware")
let authenticateToken = require('../../middlewares/authMiddleware')



// user routes
router.put("/user_registration_steps", authenticateToken, userController.user_registration_steps)
router.get("/get_user_details/:id?", authenticateToken, userController.get_user_details)
router.post("/login", validateLogin, userController.login)
router.put("/add_device_token",userController.add_device_token)
router.post("/social_login", validateSocialLogin, userController.social_login)
router.post("/verify_otp", validateVerifyOtp, userController.verify_otp)
router.put('/logout',authenticateToken,userController.logout)



//update user profile routes
router.put("/update_image_position", authenticateToken, validateUpdateImagePositions, userController.update_image_position)
router.put("/update_user_profile", authenticateToken, userController.update_user_profile)
router.put("/update_image_position", authenticateToken, validateUpdateImagePositions, userController.update_image_position)
router.put("/add_profile_images", authenticateToken, userController.add_profile_images)
router.delete("/delete_profile_image", authenticateToken, userController.delete_profile_image)
router.put("/replace_image",authenticateToken,userController.replace_image)
router.get("/get_options", authenticateToken, userController.get_options)
router.post("/import_contacts",authenticateToken, userController.import_contacts)
router.post("/block_contacts",authenticateToken,userController.block_contacts)
router.put("/remove_blocked_contacts",authenticateToken,userController.remove_blocked_contacts)
router.get("/get_contacts",authenticateToken,userController.get_contacts)
router.get("/get_blocked_contacts",authenticateToken,userController.get_blocked_contacts)
router.put("/update_phone_number",authenticateToken,userController.update_phone_number)
router.put("/verify_updated_number",authenticateToken,userController.verify_updated_number)
router.get("/get_user_images",authenticateToken,userController.get_user_images)
router.put("/update_user_location",authenticateToken,userController.update_user_location)
router.put("/request_profile_verification",authenticateToken,userController.request_profile_verification)





// update user setting routes
router.put("/update_read_receipts", authenticateToken,userController.update_read_receipts)
router.put("/update_distance_unit",authenticateToken,userController.update_distance_unit)
router.put("/show_profile_to_verified_accounts",authenticateToken,userController.show_profile_to_verified_accounts)
router.post("/createS3imageLink",userController.createS3imageLink)





//homepage routes
router.get('/recommended_users',authenticateToken,matchMakingController.recommended_users)
router.put("/like_profile",authenticateToken,matchMakingController.like_profile)
router.put("/dislike_profile",authenticateToken,matchMakingController.dislike_profile)
router.get("/get_users_who_liked_profile",authenticateToken,matchMakingController.get_users_who_liked_profile)
router.get("/get_profile_details",authenticateToken,matchMakingController.get_profile_details)



//top picks
router.get('/getTopPicks',authenticateToken,matchMakingController.getTopPicks)


// chat routes
router.get('/getChats',authenticateToken,chatController.getChats);
router.post('/createChat', authenticateToken,chatController.createChat);
router.post('/sendMessage', authenticateToken,chatController.sendMessage);
router.get('/getMessages',authenticateToken,chatController.getMessages);
router.put("/markMessagesAsRead",authenticateToken,chatController.markMessagesAsRead)
router.put('/accept_or_reject_invitation',authenticateToken,chatController.accept_or_reject_invitation)
router.get('/get_hotelInviations',authenticateToken,chatController.get_hotelInviations)


//explore rooms routes 
router.get("/get_all_rooms",authenticateToken,exploreRoomsController.get_all_rooms)
router.post("/join_room",authenticateToken,exploreRoomsController.join_room)
router.put("/left_room",authenticateToken,exploreRoomsController.left_room)
router.get("/get_matches_in_explore_rooms",authenticateToken,exploreRoomsController.get_matches_in_explore_rooms)


//notification routes 
router.get('/get_all_notification',authenticateToken,notificationController.get_all_notification)
router.put("/mark_notification_read",authenticateToken,notificationController.mark_notification_read)
router.put("/mark_all_notification_read",authenticateToken,notificationController.mark_all_notification_read)


//settings
router.get("/get_settings_info",authenticateToken,settingsController.get_settings_info)
router.get("/get_setting_page_details",authenticateToken,settingsController.get_setting_page_details)

 


//+++++++++++++++++++++++++SECRET DATING++++++++++++++++++++++

//users routes
router.get('/get_avatars',authenticateToken,secretDatingUserController.get_avatars)
router.put("/switch_secretDating_mode",authenticateToken,secretDatingUserController.switch_secretDating_mode)
router.post("/secretDating_registration",authenticateToken,secretDatingUserController.secretDating_registration)
router.get("/get_secretDating_userDetails",authenticateToken,secretDatingUserController.get_secretDating_userDetails)
router.put("/update_user_detals",authenticateToken,secretDatingUserController.update_user_detals)



// secretDating homepage
router.get("/get_secret_dating_recommendations",authenticateToken,secretDatingHomepageController.get_secret_dating_recommendations)
router.put("/secretDating_like_profile",authenticateToken,secretDatingHomepageController.secretDating_like_profile)
router.put("/secretDating_dislike_profile",authenticateToken,secretDatingHomepageController.secretDating_dislike_profile)
router.get('/get_secretDating_liked_you_profiles',authenticateToken,secretDatingHomepageController.get_secretDating_liked_you_profiles)
router.get('/get_secretDating_topPicks',authenticateToken,secretDatingHomepageController.get_secretDating_topPicks)
router.get('/get_secretDating_profile_details',authenticateToken,secretDatingHomepageController.get_secretDating_profile_details)


// chat
router.post('/secretDating_create_chat',authenticateToken,secretDatingChatController.secretDating_create_chat)
router.get('/secretDating_getChats',authenticateToken,secretDatingChatController.secretDating_getChats)
router.post('/secretDating_sendMessage',authenticateToken,secretDatingChatController.secretDating_sendMessage)
router.get('/secretDating_getMessages',authenticateToken,secretDatingChatController.secretDating_getMessages)
router.put('/secretDating_markMessagesAsRead',authenticateToken,secretDatingChatController.secretDating_markMessagesAsRead)


// safety and privacy
router.get('/get_reportReasons',authenticateToken,safetyAndPrivacyController.get_reportReasons)
router.post('/report_user',authenticateToken,safetyAndPrivacyController.report_user)
router.post('/unmatch_user',authenticateToken,safetyAndPrivacyController.unmatch_user)
router.get('/get_deleteAccount_reasons',authenticateToken,safetyAndPrivacyController.get_deleteAccount_reasons)
router.post('/delete_account',authenticateToken,safetyAndPrivacyController.delete_account)
router.put('/block_user',authenticateToken,safetyAndPrivacyController.block_user)

module.exports = router
