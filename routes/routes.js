let express = require('express')
let router = express.Router()
const userController = require("../controllers/userController")
const matchMakingController = require("../controllers/homepageController")
const chatController = require("../controllers/chatController")
const exploreRoomsController = require("../controllers/exploreRoomsController")
const {
    user_registration_steps_validator,
    validateLogin,
    validateSocialLogin,
    validateVerifyOtp,
    validateUpdateImagePositions
} = require("../middlewares/validationMiddleware")
let authenticateToken = require('../middlewares/authMiddleware')



// user routes
router.put("/user_registration_steps", authenticateToken, userController.user_registration_steps)
router.get("/get_user_details/:id?", authenticateToken, userController.get_user_details)
router.post("/login", validateLogin, userController.login)
router.post("/social_login", validateSocialLogin, userController.social_login)
router.post("/verify_otp", validateVerifyOtp, userController.verify_otp)



//update user profile routes
router.put("/update_image_position", authenticateToken, validateUpdateImagePositions, userController.update_image_position)
router.put("/update_user_profile", authenticateToken, userController.update_user_profile)
router.put("/update_image_position", authenticateToken, validateUpdateImagePositions, userController.update_image_position)
router.put("/add_profile_images", authenticateToken, userController.add_profile_images)
router.delete("/delete_profile_image", authenticateToken, userController.delete_profile_image)
router.get("/get_options", authenticateToken, userController.get_options)
router.post("/import_contacts",authenticateToken, userController.import_contacts)
router.post("/block_contacts",authenticateToken,userController.block_contacts)
router.put("/remove_blocked_contacts",authenticateToken,userController.remove_blocked_contacts)
router.get("/get_contacts",authenticateToken,userController.get_contacts)
router.get("/get_blocked_contacts",authenticateToken,userController.get_blocked_contacts)
router.put("/update_phone_number",authenticateToken,userController.update_phone_number)
router.put("/verify_updated_number",authenticateToken,userController.verify_updated_number)




// update user setting routes
router.put("/update_user_setting", userController.update_user_setting)




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


//explore rooms routes 
router.get("/get_all_rooms",authenticateToken,exploreRoomsController.get_all_rooms)
router.post("/join_room",authenticateToken,exploreRoomsController.join_room)
router.put("/left_room",authenticateToken,exploreRoomsController.left_room)
router.get("/get_matches_in_explore_rooms",authenticateToken,exploreRoomsController.get_matches_in_explore_rooms)







module.exports = router
