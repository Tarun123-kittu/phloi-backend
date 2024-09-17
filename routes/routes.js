let express = require('express')
let router = express.Router()
const userController = require("../controllers/userController")

// user routes
router.post("/create_user", userController.create_user)
router.put("/user_registration_steps", userController.user_registration_steps)
router.get("/get_user_details/:id", userController.get_user_details)





module.exports = router