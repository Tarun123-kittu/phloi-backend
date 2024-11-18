let express = require('express')
let router = express.Router()
let adminAuthController = require('../../controllers/admin/authController')


// auth
router.post('/admin_login',adminAuthController.admin_login)


module.exports = router