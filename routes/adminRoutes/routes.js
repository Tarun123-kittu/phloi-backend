let express = require('express')
let router = express.Router()
let adminAuthController = require('../../controllers/admin/authController')
let adminUserController = require('../../controllers/admin/usersController')


// auth
router.post('/admin_login',adminAuthController.admin_login)


// users
router.get("/get_all_users",adminUserController.get_all_users)
// router.post("/verification_requests",adminAuthController,verification_requests)


module.exports = router