let userModel = require('../../models/userModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')
let questionsModel = require("../../models/questionsModel")
let userCharactersticsOptionsModel = require("../../models/optionsModel")
let notificationModel = require('../../models/notificationModel')
let sendPushNotification = require("../../utils/common/pushNotifications")
let secretDatingUserModel = require("../../models/secretDatingUserModel")
let { io } = require("../../index")
const joinedRoomsModel = require('../../models/joinedRoomsModel')
const messageModel = require('../../models/messageModel')
const chatModel = require('../../models/chatModel')
const likeDislikeLimitModel = require('../../models/likeDislikeLimit')
const matchesModel = require('../../models/matchesModel')




exports.get_all_users = async (req, res) => {
    try {
        const page = parseInt(req.query?.page) || 1;
        const limit = parseInt(req.query?.limit) || 10;
        const search = req.query?.search || "";
        const skip = (page - 1) * limit;
        const gender = req.query?.gender;
        const username = req.query?.username;
        const verified = req.query?.verified;

        const pipeline = [];

        pipeline.push({
            $match: {
                current_step: 15,
            },
        });

        if (search && search.trim()) {
            const searchFilters = {
                $or: [
                    { username: { $regex: `.*${search}.*`, $options: "i" } },
                    { email: { $regex: `.*${search}.*`, $options: "i" } },
                    { gender: { $regex: `.*${search}.*`, $options: "i" } },
                ],
            };
            pipeline.push({ $match: searchFilters });
        }

        if (gender) {
            pipeline.push({
                $match: {
                    gender: { $regex: `^${gender}$`, $options: "i" },
                },
            });
        }

        if (username) {
            pipeline.push({
                $match: {
                    username: { $regex: `.*${username}.*`, $options: "i" },
                },
            });
        }

        if (verified !== undefined) {
            const isVerified = verified === "true" || verified == true;
            pipeline.push({
                $match: {
                    verified_profile: isVerified,
                },
            });
        }

        pipeline.push({
            $project: {
                username: 1,
                images: 1,
                email: 1,
                dob: 1,
                gender: 1,
                online_status: 1,
                verified_profile: 1,
                createdAt:1
            },
        });

        pipeline.push({
            $sort: { _id: -1 },
        });

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        const countPipeline = [...pipeline];
        countPipeline.pop();
        countPipeline.pop();
        countPipeline.push({ $count: "total" });

        const [users, totalResult] = await Promise.all([
            userModel.aggregate(pipeline),
            userModel.aggregate(countPipeline),
        ]);

        if (users.length < 1) {
            return res.status(400).json(errorResponse("No user found"));
        }

        const totalUsers = totalResult[0]?.total || 0;
        let resultObj = {
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            },
            users,
        };

        return res.status(200).json(successResponse("Data retrieved successfully", resultObj));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.get_profile_verification_requests = async (req, res) => {
    try {

        const page = req.query?.page || 1
        const limit = req.query?.limit || 10
        let search = req.query?.search || ""
        const skip = (page - 1) * limit


        const pipeline = [];
        pipeline.push({
            $match: {
                current_step: 15,
                initiate_verification_request: true
            },
        });


        if (search) {
            let parsedSearch = null;

            if (search == "true" || search == true) {
                parsedSearch = true;
            } else if (search === "false" || search == false) {
                parsedSearch = false;
            }

            if (parsedSearch !== null) {
                pipeline.push({
                    $match: {
                        online_status: parsedSearch
                    },
                });
            } else {
                console.warn("Invalid search value; skipping online_status filter.");
            }
        }


        pipeline.push({
            $project: {
                username: 1,
                images: 1,
                dob: 1,
                gender: 1,
                online_status: 1,
            },
        });


        pipeline.push({
            $sort: { _id: -1 },
        });


        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        const countPipeline = [...pipeline];
        countPipeline.pop();
        countPipeline.pop();
        countPipeline.push({ $count: "total" });


        const [users, totalResult] = await Promise.all([
            userModel.aggregate(pipeline),
            userModel.aggregate(countPipeline),
        ]);

        if (users.length < 1) {
            return res.status(400).json(errorResponse('No user found'))
        }

        const totalUsers = totalResult[0]?.total || 0;
        let resultObj = {
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            },
            users,
        }

        return res.status(200).json(successResponse('Data retrieved successfully', resultObj))

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}






exports.user_Details = async (req, res) => {
    try {
        const userId = req.query?.userId;


        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide a user Id in the query params'));
        }


        const user_detail = await userModel
            .findById(userId)
            .select('_id username verified_profile completed_steps show_me_to_verified_profiles  mobile_number email dob images gender show_gender intrested_to_see online_status sexual_orientation_preference_id distance_preference user_characterstics subscription_type relationship_type_preference_id profile_verification_image')
            .lean();

        if (!user_detail) {
            return res.status(400).json({
                type: "error",
                message: "User not found",
            });
        }


        const { user_characterstics, dob } = user_detail;

        let age = null;
        if (dob) {
            const dobDate = new Date(dob);
            const today = new Date();
            age = today.getFullYear() - dobDate.getFullYear();
            const monthDiff = today.getMonth() - dobDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
                age--;
            }
        }

        const [
            sexualOrientationOptions,
            relationshipTypeOption,
            allQuestionTexts,
            allAnswerTexts
        ] = await Promise.all([
            userCharactersticsOptionsModel.find({ _id: { $in: user_detail.sexual_orientation_preference_id } })
                .select('_id text')
                .lean(),
            userCharactersticsOptionsModel.findById(user_detail.relationship_type_preference_id)
                .select('_id text')
                .lean(),
            questionsModel.find({})
                .select('_id text')
                .lean(),
            userCharactersticsOptionsModel.find({})
                .select('_id text')
                .lean()
        ]);


        const questionTextMap = Object.fromEntries(allQuestionTexts.map(q => [q._id.toString(), q.text]));
        const answerTextMap = Object.fromEntries(allAnswerTexts.map(a => [a._id.toString(), a.text]));


        const processedUserCharacteristics = {};
        for (const step in user_characterstics) {
            if (user_characterstics.hasOwnProperty(step)) {
                processedUserCharacteristics[step] = user_characterstics[step].map(characteristic => {
                    const processedCharacteristic = {
                        questionText: questionTextMap[characteristic.questionId?.toString()] || null,
                        answerText: characteristic.answerId
                            ? answerTextMap[characteristic.answerId?.toString()] || null
                            : null,
                        answerTexts: characteristic.answerIds
                            ? characteristic.answerIds.map(id => answerTextMap[id?.toString()] || null).filter(Boolean)
                            : [],
                    };
                    return processedCharacteristic;
                });
            }
        }


        const sexualOrientationPreferences = sexualOrientationOptions.map(option => ({
            id: option._id,
            value: option.text,
        }));

        const relationshipTypePreference = relationshipTypeOption
            ? { id: relationshipTypeOption._id, value: relationshipTypeOption.text }
            : null;


        const userObj = {
            age,
            ...user_detail,
            sexual_orientation_preference_id: sexualOrientationPreferences,
            relationship_type_preference_id: relationshipTypePreference,
            user_characterstics: processedUserCharacteristics,

        };

        delete userObj.completed_steps;

        return res.status(200).json(successResponse('Data retrieved successfully', userObj));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.approve_or_reject_verification = async (req, res) => {
    try {
        const adminId = req.result.userId
        const { userId, verificationStatus } = req.body;


        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide user Id in the body'));
        }

        if (typeof verificationStatus !== 'boolean') {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Verification status must be a boolean value: true or false'));
        }


        const isUserExist = await userModel.findById(userId);
        if (!isUserExist) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, 'User does not exist with this user Id'));
        }


        await userModel.findByIdAndUpdate(userId, {
            $set: {
                verified_profile: verificationStatus,
                initiate_verification_request: false
            }
        });


        const notificationText = `Your verification request has been ${verificationStatus ? 'approved' : 'rejected'} by the admin.`;
        await notificationModel.create({
            userId,
            sender_id: adminId,
            notification_text: notificationText
        });


        let message = `You verification request is ${verificationStatus == true ? 'accepted' : 'rejected'}`
        let data = {
            userId: userId,
            type: 'profile_verification_update'
        }
        if (!isUserExist.deviceToken || isUserExist.deviceToken == null) {
            console.log("no token found")
        } else {
            let pushNotification = await sendPushNotification(isUserExist.deviceToken, message, data)
            console.log("notification response ------->", pushNotification)
        }
        io.emit('verification_update', userId);

        return res.status(200).json(successResponse('Verification status updated successfully'));
    } catch (error) {
        console.log('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}


exports.delete_user = async (req, res) => {
    try {
        const userId = req.query.deletedUserId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse("User not found"));
        }

        await Promise.all([
            secretDatingUserModel.deleteOne({ user_id: userId }),
            joinedRoomsModel.deleteMany({ userId }),
            notificationModel.deleteMany({ userId }),
            messageModel.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
            chatModel.deleteMany({ participants: { $in: [userId] } }),
            matchesModel.deleteMany({  users: { $in: [userId] }}),
            likeDislikeLimitModel.deleteMany({ userId }),
            userModel.findByIdAndDelete(userId)
        ]);

        return res.status(200).json(successResponse("User deleted successfully"));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};

