let notificationModel = require('../../models/notificationModel')
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require('../../utils/common/messages')
const userModel = require('../../models/userModel')



exports.get_all_notification = async (req, res) => {
    try {
        let userId = req.result.userId
        let notification_type = req.query.notification_type


        if (!notification_type) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide notificatio type in the query params"))
        }

        if (notification_type !== 'secret_dating' && notification_type !== 'regular_dating') {
            return res.status(400).json(
                errorResponse(
                    messages.generalError.somethingWentWrong,
                    "Notification type must be one of: 'secret_dating' or 'regular_dating'"
                )
            );
        }

        if (notification_type == 'secret_dating') {
            notification_type = 'secret dating';
        } else if (notification_type == 'regular_dating') {
            notification_type = 'regular dating';
        }

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not exist with this user Id"))
        }

        let notifications = await notificationModel.find({ userId: userId, type: notification_type })
        .select('_id userId sender_id notification_text read createdAt')
        .sort({ createdAt: -1 });
        let unreadNotificationCount = await notificationModel.countDocuments({ userId: userId, read: false, type: notification_type }).lean()

       
       
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
        let userId = req.result.userId;
        let notification_type = req.query.notification_type


        if (notification_type !== 'secret_dating' && notification_type !== 'regular_dating') {
            return res.status(400).json(
                errorResponse(
                    messages.generalError.somethingWentWrong,
                    "Notification type must be one of: 'secret_dating' or 'regular_dating'"
                )
            );
        }


        if (notification_type == 'secret_dating') {
            notification_type = 'secret dating';
        } else if (notification_type == 'regular_dating') {
            notification_type = 'regular dating';
        }


        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user Id")) }

        await notificationModel.updateMany(
            { userId: userId, type: notification_type },
            {
                $set: { read: true }
            }
        );

        return res.status(200).json(successResponse("All notifications mark as read"))

    } catch (error) {
        console.log("ERROR", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}