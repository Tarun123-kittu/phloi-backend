let notificationModel = require('../models/notificationModel')
let { errorResponse, successResponse } = require("../utils/responseHandler")
let messages = require('../utils/messages')
const userModel = require('../models/userModel')



exports.get_all_notification = async (req, res) => {
    try {
        let userId = req.result.userId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not exist with this user Id"))
        }

        let notifications = await notificationModel.find({userId:userId})
        console.log("notifications -----",notifications)
         
        return res.status

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}