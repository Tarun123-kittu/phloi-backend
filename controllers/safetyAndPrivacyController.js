let reasonsArchieveModel = require('../models/reasonsArchieve')
let userModel = require("../models/userModel")
let reportedUserModel = require("../models/reportedUsers")
const { errorResponse, successResponse } = require('../utils/responseHandler');
const messages = require("../utils/messages");
const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const notificationModel = require('../models/notificationModel');
const matchesModel = require('../models/matchesModel');
const joinedRoomsModel = require('../models/joinedRoomsModel');
const likeDislikeLimitModel = require('../models/likeDislikeLimit');
const secretDatingUserModel = require('../models/secretDatingUserModel');
const deletedUserModel = require('../models/deletedUsersModel')



exports.get_reportReasons = async (req, res) => {
    try {
        let userId = req.result.userId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this user Id'))
        }

        let reportReasons = await reasonsArchieveModel.find({ type: 'report' }).select('_id reason').lean()

        return res.status(200).json(successResponse('Data retreived successfully', reportReasons))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}






exports.report_user = async (req, res) => {
    try {
        const userId = req.result.userId;
        const reported_userId = req.body.reported_userId;
        const report_reason_id = req.body.report_reason_id;


        if (!reported_userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide reported user Id"))
        }

        if (!report_reason_id) {
            return res.status(400).json(errorResponse('Please provide reason why you want to report this user', 'Please provide report reason id in the body'))
        }

        const isUserExist = await userModel.findById(userId);
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this user ID'))
        }

        const isReportedUserExist = await userModel.findById(reported_userId);
        if (!isReportedUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Reported user not found'))
        }

        let isReportReasonExist = await reasonsArchieveModel.findById(report_reason_id)
        if (!isReportReasonExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "report reason doesn't exist with this report reason id"))
        }

        const existingReport = await reportedUserModel.findOne({
            user_mobile: isReportedUserExist.mobile_number,
            "reportDetails.user_who_reported": userId
        });

        if (existingReport) {
            return res.status(400).json(errorResponse('You have already reported this user'))
        }


        const reportedUser = await reportedUserModel.findOneAndUpdate(
            { user_mobile: isReportedUserExist.mobile_number },
            {
                $inc: { reportCount: 1 },
                $push: { reportDetails: { user_who_reported: userId, report_reason_id } }
            },
            { new: true, upsert: true }
        );

        res.status(200).json(successResponse('User reported successfully', reportedUser))

    } catch (error) {
        console.log(error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




exports.unmatch_user = async (req, res) => {
    try {
        let userId = req.result.userId
        let unmatch_userId = req.body.unmatch_userId

        if (!unmatch_userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide unmatch_userId in body'))
        }
        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User does not exist with this userId'))
        }

        let isUnmatchUserExist = await userModel.findById(unmatch_userId)
        if (!isUnmatchUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'unmatch user not found with this unmatch userId'))
        }

        await chatModel.deleteMany({ participants: { $all: [userId, unmatch_userId] } });

        await messageModel.deleteMany({
            $or: [
                { sender: userId, receiver: unmatch_userId },
                { sender: unmatch_userId, receiver: userId }
            ]
        })

        await notificationModel.deleteMany({
            $or: [
                { userId: userId, sender_id: unmatch_userId },
                { userId: unmatch_userId, sender_id: userId }
            ]
        })

        await matchesModel.deleteMany({ users: { $all: [userId, unmatch_userId] } })


        await userModel.findByIdAndUpdate(userId, {
            $pull: { likedUsers: unmatch_userId, dislikedUsers: unmatch_userId }
        });

        await secretDatingUserModel.updateMany(
            { user_id: userId },
            {
                $pull: { likedUsers: unmatch_userId, dislikedUsers: unmatch_userId }
            }
        );

        return res.status(200).json(successResponse('User unmatched successfully'))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}







exports.get_deleteAccount_reasons = async (req, res) => {
    try {
        let userId = req.result.userId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this userId'))
        }

        let deleteAccountReasons = await reasonsArchieveModel.find({ type: 'delete_account' }).select('_id reason').lean()

        return res.status(200).json(successResponse('Data retrieved', deleteAccountReasons))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




exports.delete_account = async (req, res) => {
    try {
        const userId = req.result.userId;
        const deleteReason_id = req.query.deleteReason_id;
        const deleteReason = req.query.deleteReason;


        const isUserExist = await userModel.findById(userId);
        if (!isUserExist) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this user ID.'));
        }

        if ((!deleteReason_id && !deleteReason) || (deleteReason_id && deleteReason)) {
            return res.status(400).json(errorResponse(messages.validation.invalidInput, "Please provide either deleteAccount reason ID or deleteAccount reason, but not both."));
        }


        await Promise.all([
            messageModel.deleteMany({
                $or: [{ sender: userId }, { receiver: userId }]
            }).then(result => console.log(`Messages deleted: ${result.deletedCount}`)),

            chatModel.deleteMany({ participants: { $in: [userId] } })
                .then(result => console.log(`Chats deleted: ${result.deletedCount}`)),

            notificationModel.deleteMany({
                $or: [{ userId: userId }, { sender_id: userId }]
            }).then(result => console.log(`Notifications deleted: ${result.deletedCount}`)),

            joinedRoomsModel.deleteMany({ userId: userId })
                .then(result =>
                    console.log(`Joined rooms deleted: ${result.deletedCount}`)),

            likeDislikeLimitModel.deleteMany({ userId: userId })
                .then(result => console.log(`Likes/Dislikes deleted: ${result.deletedCount}`)),

            matchesModel.deleteMany({ users: { $in: [userId] } })
                .then(result => console.log(`Matches deleted: ${result.deletedCount}`)),

            secretDatingUserModel.findOneAndDelete({ user_id: userId })
                .then(result => console.log(`Secret dating user deleted: ${result ? "Yes" : "No"}`))
        ]);

        await deletedUserModel.findOneAndUpdate(
            { user_mobile: isUserExist.mobile_number },
            {
                $inc: { deleteCount: 1 },
                $push: { deleteAccountDetails: { deleteAccount_reason_id: deleteReason_id, deleteAccountReasonText: deleteReason } }
            },
            { new: true, upsert: true }
        );

        await userModel.findByIdAndDelete(userId);

        res.status(200).json(successResponse("Account deleted successfully", "The user's account and related data have been deleted."));
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.block_user = async (req, res) => {
    try {
        let userId = req.result.userId
        let blocked_user_id = req.query.blocked_user_id

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this userId"))
        }
        if (!blocked_user_id) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide blocked user Id in query params'))
        }

        let isBlockedUserExist = await userModel.findById(blocked_user_id)
        if (!isBlockedUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User to block with this Id doesn't exist"))
        }

        await chatModel.deleteMany({ participants: { $all: [userId, blocked_user_id] } });

        await messageModel.deleteMany({
            $or: [
                { sender: userId, receiver: blocked_user_id },
                { sender: blocked_user_id, receiver: userId }
            ]
        })

        await notificationModel.deleteMany({
            $or: [
                { userId: userId, sender_id: blocked_user_id },
                { userId: blocked_user_id, sender_id: userId }
            ]
        })

        await matchesModel.updateMany({ users: { $all: [userId, blocked_user_id] } }, {
            $set: {
                blocked_by: userId
            }
        })
      return res.status(200).json(successResponse('User blocked successfully'))
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}