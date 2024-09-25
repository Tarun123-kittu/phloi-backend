let express = require('express')
let router = express.Router()
const userController = require("../controllers/userController")
const matchMakingController = require("../controllers/homepageController")
const chatController = require("../controllers/chatController")
const exploreRoomsController = require("../controllers/exploreRoomsController")
const preferencesController = require("../controllers/preferences")
const characteristicsController = require("../controllers/characterstics")
const {
    user_registration_steps_validator,
    validateLogin,
    validateSocialLogin,
    validateVerifyOtp,
    validateUpdateImagePositions
} = require("../middlewares/validationMiddleware")
let authenticateToken = require('../middlewares/authMiddleware')



// user routes
router.put("/user_registration_steps", authenticateToken, user_registration_steps_validator, userController.user_registration_steps)
router.get("/get_user_details/:id?", authenticateToken, userController.get_user_details)
router.post("/login", validateLogin, userController.login)
router.post("/social_login", validateSocialLogin, userController.social_login)
router.post("/verify_otp", validateVerifyOtp, userController.verify_otp)


//update user profile routes
router.put("/update_image_position", authenticateToken, validateUpdateImagePositions, userController.update_image_position)
router.put("/update_user_profile", authenticateToken, userController.update_user_profile)


// update user setting routes
router.put("/update_user_setting", userController.update_user_setting)
router.put("/update_image_position", authenticateToken, validateUpdateImagePositions, userController.update_image_position)
router.put("/update_user_profile", authenticateToken, userController.update_user_profile)
router.put("/add_profile_images", authenticateToken, userController.add_profile_images)
router.delete("/delete_profile_image", authenticateToken, userController.delete_profile_image)


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


//preferences routes
router.get("/get_all_sexual_orientations",authenticateToken,preferencesController.get_all_sexual_orientations)
router.get("/get_all_relationship_types",authenticateToken,preferencesController.get_all_relationship_types)


//characterstics controller
router.get("/get_all_communication_styles",authenticateToken,characteristicsController.get_all_communication_styles)
router.get("/get_all_love_receives",authenticateToken,characteristicsController.get_all_love_receives)
router.get("/get_all_drink_frequency",authenticateToken,characteristicsController.get_all_drink_frequency)
router.get("/get_all_smoke_frequency",authenticateToken,characteristicsController.get_all_smoke_frequency)
router.get("/get_all_workout_frequency",authenticateToken,characteristicsController.get_all_workout_frequency)
router.get("/get_all_interests",authenticateToken,characteristicsController.get_all_interests)



module.exports = router
