let secretDatingMatchAlgorithm = require('../../utils/secretDating/secretDatingMatchMaking')
let userModel = require('../../models/userModel')
let secretDatingUserModel = require('../../models/secretDatingUserModel')
let matchModel = require("../../models/matchesModel")
let optionsModel = require("../../models/optionsModel")
let likeDislikeLimitModel = require("../../models/likeDislikeLimit")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let topPicksMatchScore = require("../../utils/secretDating/secretDatingTopPicks")
let messages = require("../../utils/common/messages")
// let sendPushNotification = require("../../utils/common/pushNotifications")
let notificationModel = require("../../models/notificationModel")
let { io } = require("../../index")




exports.get_secret_dating_recommendations = async (req, res) => {
    try {
        const userId = req.result.userId;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const ageMin = parseInt(req.query.age_min, 10)
        const ageMax = parseInt(req.query.age_max, 10)
        let maxDistance = parseInt(req.query.max_distance, 10)
        const interestedIn = req.query.interested_in
        let show_verified_profiles = req.query.show_verified_profiles
        const applyFilter = req.query.applyFilter || false


        const currentUser = await userModel.findById(userId).lean();
        if (!currentUser) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }
        const secretDatingCurrentUser = await secretDatingUserModel.findOne({ user_id: currentUser._id })

        if (applyFilter == 'true' || applyFilter == true) {
            if (!ageMin || !ageMax || !maxDistance || !interestedIn || !show_verified_profiles) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide all the filter values to find match")) }
            show_verified_profiles = (show_verified_profiles === 'true')
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

        const matchedUsers = await secretDatingMatchAlgorithm(currentUser, secretDatingCurrentUser, page, limit, filterApplied);

        return res.status(200).json({
            type: 'success',
            message: 'Users matched successfully',
            currentPage: page,
            totalDocuments: matchedUsers.allUsers,
            users: matchedUsers.paginatedUsers
        });

    } catch (error) {
        console.log('ERROR:: ', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}







exports.secretDating_like_profile = async (req, res) => {
    try {
        const currentUserId = req.result.userId;
        const likedUserId = req.query.likedUserId;

        if (!likedUserId) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide liked user's id")) }


        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }

        const secretDatingUser = await secretDatingUserModel.findOne({ user_id: currentUserId });
        if (!secretDatingUser) {
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

        const likedUser = await secretDatingUserModel.findOne({ user_id: likedUserId });
        if (!likedUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User to be liked not found in secret dating"));
        }


        if (secretDatingUser.likedUsers.includes(likedUserId)) {
            return res.status(400).json(errorResponse("You have already liked this user."));
        }



        secretDatingUser.likedUsers.push(likedUserId);

        await secretDatingUser.save();


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
                type: 'secret dating'
            });

            if (!matchExists) {
                const newMatch = new matchModel({
                    users: [currentUserId, likedUserId],
                    createdAt: Date.now(),
                    type: 'secret dating'
                });
                await newMatch.save();

                io.emit('its_a_match_in_secretDating', {
                    matchId: newMatch._id,
                    users: [currentUserId, likedUserId],
                    usernames: [secretDatingUser.name, likedUser.name],
                    message: `It's a match between ${currentUser.username} and ${likedUser.username}!`,
                    likedUser_image: likedUser.profile_image == null ? likedUser.avatar : likedUser.profile_image
                });

            
             

            }

            await notificationModel.create({ userId: likedUserId, sender_id: currentUserId, notification_text: `You got a match with ${currentUser.username}`, type: 'secret dating' })
            await notificationModel.create({ userId: currentUserId, sender_id: likedUserId, notification_text: `You got a match with ${likedUser.name}`, type: 'secret dating' })

            //push notification
            // const sendMatchNotification = async (deviceToken, username, userId) => {
            //     const title = 'Its a match!';
            //     const msg = `You got a match with ${username}`;
            //     const data = { userId };

            //     await sendPushNotification(deviceToken, msg, data, title);
            // };

            //     await sendMatchNotification(likedUser.deviceToken, currentUser.username, likedUserId);
            //     await sendMatchNotification(currentUser.deviceToken, likedUser.username, currentUserId);

            let participants = { currentUserId, likedUserId }

            return res.status(200).json(successResponse("Mutual like! A new match has been created.", participants));
        }

        return res.status(200).json(successResponse("User liked successfully."));

    } catch (error) {
        console.log('ERROR:: ', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}






exports.secretDating_dislike_profile = async (req, res) => {
    const currentUserId = req.result.userId;
    const dislikedUserId = req.query.dislikedUserId;

    try {

        if (!dislikedUserId) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide disliked user's id")) }

        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Current user not found"));
        }

        const secretDatingUser = await secretDatingUserModel.findOne({ user_id: currentUserId });
        if (!secretDatingUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Current user not found in secret dating"));
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

        const dislikedUser = await secretDatingUserModel.findOne({ user_id: dislikedUserId });
        if (!dislikedUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User to be disliked not found in secret dating."));
        }

        if (secretDatingUser.dislikedUsers.includes(dislikedUserId)) {
            return res.status(400).json(errorResponse("You have already disliked this user."));
        }


        secretDatingUser.dislikedUsers.push(dislikedUserId);
        await secretDatingUser.save();


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
}





exports.get_secretDating_liked_you_profiles = async (req, res) => {
    const loggedInUserId = req.result.userId;

    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    try {
        const loggedInUser = await secretDatingUserModel.findOne({ user_id: loggedInUserId }).select('likedUsers').lean();

        const likedUsersByLoggedInUser = loggedInUser.likedUsers || [];

        const totalProfilesCount = await secretDatingUserModel.countDocuments({
            likedUsers: loggedInUserId,
            user_id: { $nin: likedUsersByLoggedInUser }
        });

        const usersWhoLikedProfile = await secretDatingUserModel.find({
            likedUsers: loggedInUserId,
            user_id: { $nin: likedUsersByLoggedInUser }
        })
            .select('_id user_id name avatar profile_image interested_to_see')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return res.status(200).json({
            type: 'success',
            message: 'Users who liked your profile fetched successfully.',
            total_profiles: totalProfilesCount,
            users: usersWhoLikedProfile,
            current_page: page,
            total_pages: Math.ceil(totalProfilesCount / limit)
        });
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.get_secretDating_topPicks = async (req, res) => {
    try {
        const userId = req.result.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user id."));
        }

        const secretDatingUser = await secretDatingUserModel.findOne({ user_id: userId });
        if (!secretDatingUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user id in secret dating."));
        }

        const preferredGender = secretDatingUser.interested_to_see;
        const maxDistance = user.distance_preference || 50;
        const blockedContacts = user.blocked_contacts || [];


        const nearbyUsers = await userModel.aggregate([

            {
                $geoNear: {
                    near: { type: "Point", coordinates: user.location.coordinates },
                    distanceField: "distance",
                    maxDistance: maxDistance * 1000,
                    query: {
                        _id: { $ne: userId },
                        gender: preferredGender === 'everyone' ? { $exists: true } : preferredGender,
                        mobile_number: { $nin: blockedContacts.map(contact => contact.number) }
                    },
                    spherical: true
                }
            },

            {
                $lookup: {
                    from: 'secret_dating_users',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'secretDatingInfo'
                }
            },

            {
                $unwind: {
                    path: "$secretDatingInfo",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $match: {
                    $and: [
                        { 'secretDatingInfo._id': { $ne: secretDatingUser._id } },
                        { _id: { $nin: [...secretDatingUser.likedUsers, ...secretDatingUser.dislikedUsers] } },
                        { 'secretDatingInfo.current_step': 4 }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    gender: 1,
                    'secretDatingInfo._id': 1,
                    'secretDatingInfo.name': 1,
                    'secretDatingInfo.avatar': 1,
                    'secretDatingInfo.profile_image': 1,
                    'secretDatingInfo.sexual_orientation_preference_id': 1,
                    'secretDatingInfo.relationship_preference': 1
                }
            }
        ]);


        const matchedUsers = nearbyUsers.map(nearbyUser => {

            const score = topPicksMatchScore(secretDatingUser, nearbyUser);
            const userImage = nearbyUser.secretDatingInfo.profile_image
            const avatar = nearbyUser.secretDatingInfo.avatar

            return {
                _id: nearbyUser.secretDatingInfo._id,
                userId: nearbyUser._id,
                username: nearbyUser.secretDatingInfo.name,
                image: userImage || null,
                avatar: avatar || null,
                matchScorePercentage: score.toFixed(2)
            };
        }).filter(user => user.matchScorePercentage >= 10);


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
}




exports.get_secretDating_profile_details = async (req, res) => {
    try {
        let userId = req.query.userId;

        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User id not present in query params'))
        }

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this user Id'))
        }

        let secretDatingUser = await secretDatingUserModel.findOne({ user_id: userId })
        if (!secretDatingUser) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this user Id in secret dating'))
        }

        const orientationTexts = await optionsModel.find({
            _id: { $in: secretDatingUser.sexual_orientation_preference_id }
        }).select('text _id');

        const relationshipText = await optionsModel.findOne({
            _id: secretDatingUser.relationship_preference
        }).select('text _id');


        let details = {
            ...secretDatingUser.toObject(),
            sexual_orientation_texts: orientationTexts,
            relationship_preference_text: relationshipText ? relationshipText.text : null,
        };

        return res.status(200).json(successResponse('Data retrieved successfully', details));

    } catch (error) {
        console.error("ERROR::", error);
        res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}