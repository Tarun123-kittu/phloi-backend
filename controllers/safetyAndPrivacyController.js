let reportReasonModel = require('../models/reportReasons')
let userModel = require("../models/userModel")
let reportedUserModel = require("../models/reportedUsers")
const { errorResponse, successResponse } = require('../utils/responseHandler');
const messages = require("../utils/messages");
const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const notificationModel = require('../models/notificationModel');
const matchesModel = require('../models/matchesModel');



exports.get_reportReasons = async (req, res) => {
    try {
        let userId = req.result.userId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this user Id'))
        }

        let reportReasons = await reportReasonModel.find().select('_id reason').lean()

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


        const existingReport = await reportedUserModel.findOne({
            user_id: reported_userId,
            "reportDetails.user_who_reported": userId
        });

        if (existingReport) {
            return res.status(400).json(errorResponse('You have already reported this user'))
        }


        const reportedUser = await reportedUserModel.findOneAndUpdate(
            { user_id: reported_userId },
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

        if(!unmatch_userId){
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,'Please provide unmatch_userId in body'))
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

        await matchesModel.updateMany({ users: { $all: [userId, unmatch_userId] } }, {
            $set: {
                isUnmatched: true
            }
        })

        return res.status(200).json(successResponse('User unmatched successfully'))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}



