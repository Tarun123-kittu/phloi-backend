let express = require('express')
let router = express.Router()
let adminAuthController = require('../../controllers/admin/authController')


// auth
router.post('/admin_registration',adminAuthController.admin_registration)


module.exports = router