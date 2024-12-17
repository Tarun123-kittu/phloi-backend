let userModel = require("../../models/userModel")
let matchModel = require("../../models/matchesModel")
let QuestionModel = require('../../models/questionsModel');
let AnswerModel = require('../../models/optionsModel');
let notificationModel = require('../../models/notificationModel')
let homepageMatchAlgorithm = require("../../utils/regularDating/homepageMatchMaking")
let calculateMatchScore = require("../../utils/regularDating/calculateTopPicks")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
let { io } = require('../../index');
const likeDislikeLimitModel = require("../../models/likeDislikeLimit");
const sendPushNotification = require("../../utils/common/pushNotifications");
const { errorMonitor } = require("nodemailer/lib/xoauth2");
let mongoose = require('mongoose');
const secretDatingUserModel = require("../../models/secretDatingUserModel");







exports.recommended_users = async (req, res) => {
    try {
        const userId = req.result.userId;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const ageMin = parseInt(req.query.age_min, 10)
        var ageMax = parseInt(req.query.age_max, 10)
        let maxDistance = parseInt(req.query.max_distance, 10)
        const interestedIn = req.query.interested_in
        let show_verified_profiles = req.query.show_verified_profiles
        const applyFilter = req.query.applyFilter || false



        const currentUser = await userModel.findById(userId).lean();
        if (!currentUser) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }
        if (applyFilter == 'true' || applyFilter == true) {

            if (!ageMin || !ageMax || !maxDistance || !interestedIn || !show_verified_profiles) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide all the filter values to find match")) }
            show_verified_profiles = (show_verified_profiles === 'true')
            ageMax = ageMax + 1
        }

        if (currentUser.setting.distance_in === 'mi') {
            maxDistance = maxDistance * 1.60934;
        }


        let filterApplied
        if (applyFilter == 'true' || applyFilter == true) {

            filterApplied = {
                ageMin: ageMin,
                ageMax: ageMax,
                maxDistance: maxDistance,
                interestedIn: interestedIn,
                show_verified_profiles: show_verified_profiles
            }
        }
        // console.log('age -----',ageMax)
        const matchedUsers = await homepageMatchAlgorithm(currentUser, page, limit, filterApplied);

        return res.status(200).json({
            type: 'success',
            message: 'Users retreived successfully',
            currentPage: page,
            totalDocuments: matchedUsers.allUsers,
            users: matchedUsers.paginatedUsers
        });

    } catch (error) {
        console.log('ERROR:: ', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




exports.like_profile = async (req, res) => {
    try {
        const currentUserId = req.result.userId;
        const likedUserId = req.query.likedUserId;

        if (!likedUserId) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide liked user's id")) }

        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);


        if (currentUser.subscription_type == 'free') {

            let todayLimit = await likeDislikeLimitModel.findOne({
                userId: currentUser._id,
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            if (!todayLimit) {
                todayLimit = await likeDislikeLimitModel.create({
                    userId: currentUser._id,
                    like_count: 0,
                    dislike_count: 0
                });
            } else {
                if (todayLimit.like_count >= 15) { return res.status(400).json(errorResponse("You have reached your daily limit for liking profiles on your free account.")) }
            }
        }

        const likedUser = await userModel.findById(likedUserId);
        if (!likedUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User to be liked not found"));
        }


        if (currentUser.likedUsers.includes(likedUserId)) {
            return res.status(400).json(errorResponse("You have already liked this user."));
        }



        currentUser.likedUsers.push(likedUserId);

        await currentUser.save();


        let todayLimit = await likeDislikeLimitModel.findOne({
            userId: currentUser._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });
        if (!todayLimit) {
            todayLimit = await likeDislikeLimitModel.create({
                userId: currentUser._id,
                like_count: 0,
                dislike_count: 0
            });
        }
        await likeDislikeLimitModel.findOneAndUpdate({
            userId: currentUser._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            },
            $set: {
                like_count: todayLimit.like_count + 1
            }
        })

        if (likedUser.likedUsers.includes(currentUserId)) {

            const matchExists = await matchModel.findOne({
                users: { $all: [currentUserId, likedUserId] },
                type: 'regular dating'
            });
            let newMatch
            if (!matchExists) {
                newMatch = new matchModel({
                    users: [currentUserId, likedUserId],
                    createdAt: Date.now(),
                    type: 'regular dating'
                });
                await newMatch.save();

                io.emit('its_a_match', {
                    matchId: newMatch._id,
                    users: [currentUserId, likedUserId],
                    usernames: [currentUser.username, likedUser.username],
                    message: `It's a match between ${currentUser.username} and ${likedUser.username}!`,
                    likedUser_image: likedUser.images[0]
                });

            }
            await notificationModel.create({ userId: likedUserId, sender_id: currentUserId, notification_text: `You got a match with ${currentUser.username}`, type: 'regular dating' })
            await notificationModel.create({ userId: currentUserId, sender_id: likedUserId, notification_text: `You got a match with ${likedUser.username}`, type: 'regular dating' })

            // push notification
            const sendMatchNotification = async (deviceToken, username, userId) => {
                const title = 'Its a match!';
                const msg = `You got a match with ${username}`;
                const data = {
                    userId,
                    type: "match"
                };

                await sendPushNotification(deviceToken, msg, data, title);
            };

            await sendMatchNotification(likedUser.deviceToken, currentUser.username, likedUserId);
            // await sendMatchNotification(currentUser.deviceToken, likedUser.username, currentUserId);


            let participants = {
                currentUserId,
                likedUserId,
                matchId: newMatch._id,
                users: [currentUserId, likedUserId],
                usernames: [currentUser.username, likedUser.username],
                message: `It's a match between ${currentUser.username} and ${likedUser.username}!`,
                likedUser_image: likedUser.images[0],
                currentUser_image: currentUser.images[0]
            }

            return res.status(200).json(successResponse("Mutual like! A new match has been created.", participants));
        }

        return res.status(200).json(successResponse("User liked successfully."));

    } catch (error) {
        console.log('ERROR:: ', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




exports.dislike_profile = async (req, res) => {
    const currentUserId = req.result.userId;
    const dislikedUserId = req.query.dislikedUserId;

    try {

        if (!dislikedUserId) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide disliked user's id")) }

        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Current user not found"));
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (currentUser.subscription_type == 'free') {

            let todayLimit = await likeDislikeLimitModel.findOne({
                userId: currentUser._id,
                createdAt: {
                    $gte: today,
                    $lt: tomorrow
                }
            });

            if (!todayLimit) {
                todayLimit = await likeDislikeLimitModel.create({
                    userId: currentUser._id,
                    like_count: 0,
                    dislike_count: 0
                });
            } else {
                if (todayLimit.dislike_count >= 15) { return res.status(400).json(errorResponse("You have reached your daily limit for disliking profiles on your free account.")) }
            }
        }

        const dislikedUser = await userModel.findById(dislikedUserId);
        if (!dislikedUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User to be disliked not found."));
        }

        if (currentUser.dislikedUsers.includes(dislikedUserId)) {
            return res.status(400).json(errorResponse("You have already disliked this user."));
        }


        currentUser.dislikedUsers.push(dislikedUserId);
        await currentUser.save();


        let todayLimit = await likeDislikeLimitModel.findOne({
            userId: currentUser._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        });
        if (!todayLimit) {
            todayLimit = await likeDislikeLimitModel.create({
                userId: currentUser._id,
                like_count: 0,
                dislike_count: 0
            });
        }
        await likeDislikeLimitModel.findOneAndUpdate({
            userId: currentUser._id,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            },
            $set: {
                dislike_count: todayLimit.dislike_count + 1
            }
        })


        return res.status(200).json(successResponse("User disliked successfully."));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.get_users_who_liked_profile = async (req, res) => {
    const loggedInUserId = req.result.userId;

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {

        const loggedInUser = await userModel.findById(loggedInUserId).select('likedUsers').lean();
        const likedUsersByLoggedInUser = loggedInUser.likedUsers || [];

        const totalProfilesCount = await userModel.countDocuments({
            likedUsers: loggedInUserId,
            _id: { $nin: likedUsersByLoggedInUser }
        });



        const loggedInId = new mongoose.Types.ObjectId(loggedInUserId)
        const usersWhoLikedProfile = await userModel.aggregate([
            {

                $match: {
                    likedUsers: loggedInId,
                    _id: { $nin: likedUsersByLoggedInUser }
                }
            },
            {
                $unwind: {
                    path: "$user_characterstics.step_13",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'user_characterstics.step_13.answerIds',
                    foreignField: '_id',
                    as: 'interests'
                }
            },
            {

                $lookup: {
                    from: "options",
                    localField: "sexual_orientation_preference_id",
                    foreignField: "_id",
                    as: "sexual_orientation_details"
                }
            },
            {

                $lookup: {
                    from: "options",
                    localField: "relationship_type_preference_id",
                    foreignField: "_id",
                    as: "relationship_preference"
                }
            },


            {

                $project: {
                    _id: 1,
                    username: 1,
                    images: 1,
                    gender: 1,
                    show_gender: 1,
                    intrested_to_see: 1,
                    show_sexual_orientation: 1,
                    bio: 1,
                    sexual_orientation: {
                        $map: {
                            input: '$sexual_orientation_details',
                            as: 'orientation',
                            in: '$$orientation.text'
                        }
                    },
                    'relationship_preference.text': 1,
                    interests: { $map: { input: '$interests', as: 'interest', in: '$$interest.text' } },
                }
            },
            {

                $sort: { createdAt: -1 }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ]).exec();



        return res.status(200).json({
            type: 'success',
            message: 'Users who liked your profile fetched successfully.',
            total_profiles: totalProfilesCount,
            data: usersWhoLikedProfile,
            current_page: page,
            total_pages: Math.ceil(totalProfilesCount / limit)
        });
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.get_profile_details = async (req, res) => {
    try {
        let id = req.query.userId;
        if (!id) {
            return res.status(404).json(errorResponse("Please provide userId"));
        }


        let user = await userModel.findById(id).lean();
        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }


        const getSingleAnswerStep = async (userSteps) => {
            const groupedAnswers = [];
            for (const step of userSteps || []) {
                const question = await QuestionModel.findById(step.questionId).lean();
                const answer = await AnswerModel.findById(step.answerId).lean();
                if (question && answer) {
                    groupedAnswers.push({
                        question: question.identify_text,
                        answers: [answer.text]
                    });
                }
            }
            return groupedAnswers;
        };


        const getMultipleAnswerStep = async (userSteps) => {
            const groupedAnswers = [];
            for (const step of userSteps || []) {
                const question = await QuestionModel.findById(step.questionId).lean();
                const answers = await AnswerModel.find({ _id: { $in: step.answerIds } }).lean();
                if (question) {
                    groupedAnswers.push({
                        question: question.identify_text,
                        answers: answers.map(answer => answer.text)
                    });
                }
            }
            return groupedAnswers;
        };


        const getAnswerText = async (idOrIds) => {

            if (Array.isArray(idOrIds)) {
                const answers = await AnswerModel.find({ _id: { $in: idOrIds } }).lean();
                return answers.map(answer => answer.text);
            } else {
                const answer = await AnswerModel.findById(idOrIds).lean();
                return answer ? answer.text : null;
            }
        };


        const step11Answers = user.user_characterstics?.step_11
            ? await getSingleAnswerStep(user.user_characterstics.step_11)
            : [];
        const step12Answers = user.user_characterstics?.step_12
            ? await getSingleAnswerStep(user.user_characterstics.step_12)
            : [];
        const step13Answers = user.user_characterstics?.step_13
            ? await getMultipleAnswerStep(user.user_characterstics.step_13)
            : [];


        const sexualOrientationText = user.sexual_orientation_preference_id
            ? await getAnswerText(user.sexual_orientation_preference_id)
            : [];


        const lookingForText = user.relationship_type_preference_id
            ? await getAnswerText(user.relationship_type_preference_id)
            : null;


        const userDetails = {
            username: user.username,
            age: user.dob,
            gender: user.gender,
            show_gender: user.show_gender,
            interested_in: user.intrested_to_see,
            sexual_orientation: sexualOrientationText,
            show_sexual_orientation: user.show_sexual_orientation,
            looking_for: lookingForText,
            study: user.study,
            images: user.images,
            step_11: step11Answers,
            step_12: step12Answers,
            step_13: step13Answers
        };


        return res.status(200).json(successResponse("Details fetched successfully", userDetails));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.undo_disliked_profile = async (req, res) => {
    try {
        const userId = req.result.userId;
        const dislikedUserId = req.query.dislikeUserId;
        const mode = req.query.mode;

        if (!dislikedUserId) {
            return res.status(400).json(
                errorResponse(messages.generalError.somethingWentWrong, "Disliked user Id not found")
            );
        }

        const user_id = new mongoose.Types.ObjectId(dislikedUserId);

       
        const model = mode === 'secret' ? secretDatingUserModel : userModel;
        const queryCondition = mode === 'secret' ? { user_id: userId } : { _id: userId }; 

  
        const isUserExist = await model.findOneAndUpdate(
            queryCondition,
            { $pull: { dislikedUsers: user_id } },
            { new: true }
        );

        if (!isUserExist) {
            return res.status(400).json(
                errorResponse(
                    messages.generalError.somethingWentWrong,
                    mode === 'secret'
                        ? "User doesn't exist with this userId in secret dating"
                        : "User doesn't exist with this userId"
                )
            );
        }

        return res.status(200).json(successResponse("Dislike undo",isUserExist));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(
            errorResponse(messages.generalError.somethingWentWrong, error.message)
        );
    }
}





exports.getTopPicks = async (req, res) => {
    try {
        const userId = req.result.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user id."));
        }


        const preferredGender = user.intrested_to_see;
        const maxDistance = user.distance_preference || 50;
        const likedUsers = user.likedUsers
        const dislikedUsers = user.dislikedUsers
        let blocked_contacts = user.blocked_contacts



        const user_id = new mongoose.Types.ObjectId(userId)
        const nearbyUsers = await userModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: user.location.coordinates },
                    distanceField: "distance",
                    maxDistance: maxDistance * 1000,
                    spherical: true,
                    query: {
                        _id: { $ne: user_id, $nin: [...likedUsers, ...dislikedUsers] },
                        gender: preferredGender == 'everyone' ? { $exists: true } : preferredGender,
                        mobile_number: { $nin: blocked_contacts.map(contact => contact.number) }
                    }
                }
            },
            {
                $unwind: {
                    path: "$user_characterstics.step_13",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'user_characterstics.step_13.answerIds',
                    foreignField: '_id',
                    as: 'interests'
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'sexual_orientation_preference_id',
                    foreignField: '_id',
                    as: 'sexual_orientation'
                }
            },
            {
                $lookup: {
                    from: 'options',
                    localField: 'relationship_type_preference_id',
                    foreignField: '_id',
                    as: 'relationship_preference'
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    gender: 1,
                    bio:1,
                    show_gender: 1,
                    location: 1,
                    distance: 1,
                    images: 1,
                    user_characterstics: 1,
                    study: 1,
                    dob: 1,
                    intrested_to_see: 1,
                    sexual_orientation: {
                        $map: {
                            input: '$sexual_orientation',
                            as: 'orientation',
                            in: '$$orientation.text'
                        }
                    },
                    show_sexual_orientation: 1,
                    'relationship_preference.text': 1,
                    interests: { $map: { input: '$interests', as: 'interest', in: '$$interest.text' } },
                }
            }
        ]);


        const matchedUsers = nearbyUsers.map(nearbyUser => {

            const score = calculateMatchScore(user, nearbyUser);
            // const userImage = nearbyUser.images.find(img => img.position === 1) || {};

            return {
                _id: nearbyUser._id,
                username: nearbyUser.username,
                bio:nearbyUser.bio,
                age: nearbyUser.dob ? new Date().getFullYear() - new Date(nearbyUser.dob).getFullYear() : null,
                images: nearbyUser.images || null,
                study: nearbyUser.study,
                intrested_to_see: nearbyUser.intrested_to_see,
                gender: nearbyUser.gender,
                show_gender: nearbyUser.show_gender,
                relationship_preference: nearbyUser.relationship_preference,
                sexual_orientation: nearbyUser.sexual_orientation,
                show_sexual_orientation: nearbyUser.show_sexual_orientation,
                interests: nearbyUser.interests,
                matchScorePercentage: score.toFixed(2)
            };
        }).filter(user => user.matchScorePercentage >= 30);


        matchedUsers.sort((a, b) => b.matchScorePercentage - a.matchScorePercentage);


        const startIndex = (page - 1) * limit;
        const paginatedResults = matchedUsers.slice(startIndex, startIndex + limit);

        res.status(200).json({
            totalMatches: matchedUsers.length,
            currentPage: page,
            totalPages: Math.ceil(matchedUsers.length / limit),
            data: paginatedResults
        });
    } catch (error) {
        console.error("ERROR::", error);
        res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






