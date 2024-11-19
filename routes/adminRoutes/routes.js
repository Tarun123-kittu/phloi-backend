let express = require('express')
let router = express.Router()
let verifyAdminToken = require("../../middlewares/adminAuthmiddleware")
let adminAuthController = require('../../controllers/admin/authController')
let adminUserController = require('../../controllers/admin/usersController')


// auth
router.post('/admin_login',adminAuthController.admin_login)


// users
router.get("/get_all_users",verifyAdminToken,adminUserController.get_all_users)
router.get("/get_profile_verification_requests",verifyAdminToken,adminUserController.get_profile_verification_requests)


module.exports = router