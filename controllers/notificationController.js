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

        let notifications = await notificationModel.find({ userId: userId }).select('_id userId sender_id notification_text read')
        let unreadNotificationCount = await notificationModel.countDocuments({ userId: userId, read: false }).lean()

        let data = {
            unread_notification_count: unreadNotificationCount,
            notifications: notifications
        }

        return res.status(200).json(successResponse("Notification reterived successfully", data))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.mark_notification_read = async (req, res) => {
    try {
        let notificationId = req.query.notificationId

        if (!notificationId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide notification Id in the query params"))
        }

        let isNofificationExist = await notificationModel.findById(notificationId).lean()
        if (!isNofificationExist) {
            return res.status(400).json(errorResponse(errorResponse.generalError.somethingWentWrong, "Notification do not exist with this notification Id"))
        }

        await notificationModel.findByIdAndUpdate(notificationId, {
            $set: {
                read: true
            }
        })
        let chat_participants_ids = {
            receiver_id: isNofificationExist.userId,
            sender_id: isNofificationExist.sender_id
        }

        return res.status(200).json(successResponse('Notification has been marked as read', chat_participants_ids))

    } catch (error) {
        console.log("ERROR", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}





exports.mark_all_notification_read = async (req, res) => {
    try {
    // let userId = req.result
    } catch (error) {
        console.log("ERROR", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}