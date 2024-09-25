let userModel = require("../models/userModel")
let matchModel = require("../models/matchesModel")
let relationshipPreferenceModel = require('../models/relationshipPreferencesModel')
let smokeFrequencyModel = require("../models/smokeFrequencyModel")
let drinkFrequencyModel = require("../models/drinkFrequencyModel")
let workoutFrequencyModel = require("../models/workoutFrequencyModel")
let communicationStyleModel = require("../models/communicationStyleModel")
let loveReceiveModel = require("../models/loveReceiveModel")
let interestModel = require("../models/interestsModel")
let matchAlgorithm = require("../utils/matchMaking")
let calculateMatchScore = require("../utils/calculateTopPicks")
let { errorResponse, successResponse } = require("../utils/responseHandler")
let messages = require("../utils/messages")
let {io} = require('../index')






exports.recommended_users = async (req, res) => {
 try{
    const userId = req.result.userId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;


    const currentUser = await userModel.findById(userId).lean();
    if (!currentUser) {
        return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
    }

    const matchedUsers = await matchAlgorithm(currentUser, page, limit);
    return res.status(200).json({
        type: 'success',
        message: 'Users matched successfully',
        currentPage: page,
        users: matchedUsers
    });

 }catch(error){
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


        const likedUser = await userModel.findById(likedUserId);
        if (!likedUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User to be liked not found"));
        }


        if (currentUser.likedUsers.includes(likedUserId)) {
            return res.status(400).json(errorResponse("You have already liked this user."));
        }


        currentUser.likedUsers.push(likedUserId);
        await currentUser.save();


        if (likedUser.likedUsers.includes(currentUserId)) {

            const matchExists = await matchModel.findOne({
                users: { $all: [currentUserId, likedUserId] }
            });

            if (!matchExists) {
                const newMatch = new matchModel({
                    users: [currentUserId, likedUserId],
                    createdAt: Date.now(),
                });
                await newMatch.save();
            }

            io.emit('its_a_match')

            return res.status(200).json(successResponse("Mutual like! A new match has been created."));
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

        const dislikedUser = await userModel.findById(dislikedUserId);
        if (!dislikedUser) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "User to be disliked not found."));
        }

        if (currentUser.dislikedUsers.includes(dislikedUserId)) {
            return res.status(400).json(errorResponse("You have already disliked this user."));
        }


        currentUser.dislikedUsers.push(dislikedUserId);
        await currentUser.save();

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
        const totalProfilesCount = await userModel.countDocuments({
            likedUsers: loggedInUserId
        });

        const usersWhoLikedProfile = await userModel.find({
            likedUsers: loggedInUserId
        })
            .select('_id username gender images')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        if (usersWhoLikedProfile.length === 0) {
            return res.status(200).json(successResponse("No user have liked your profile"));
        }

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

        let relationshipPromise = relationshipPreferenceModel.findById(user.preferences.relationship_type_preference_id).lean();

      
        let interestsPromise = user.characteristics?.interests_ids?.length
            ? interestModel.find({ _id: { $in: user.characteristics.interests_ids } }, 'interest').lean()
            : Promise.resolve(null);

        
        let drinkFrequencyPromise = user.characteristics?.drink_frequency_id
            ? drinkFrequencyModel.findById(user.characteristics.drink_frequency_id).lean()
            : Promise.resolve(null);

        let smokeFrequencyPromise = user.characteristics?.smoke_frequency_id
            ? smokeFrequencyModel.findById(user.characteristics.smoke_frequency_id).lean()
            : Promise.resolve(null);

        let workoutFrequencyPromise = user.characteristics?.workout_frequency_id
            ? workoutFrequencyModel.findById(user.characteristics.workout_frequency_id).lean()
            : Promise.resolve(null);

        let communicationStylePromise = user.characteristics?.communication_style_id
            ? communicationStyleModel.findById(user.characteristics.communication_style_id).lean()
            : Promise.resolve(null);

        let loveReceivePromise = user.characteristics?.love_receive_id
            ? loveReceiveModel.findById(user.characteristics.love_receive_id).lean()
            : Promise.resolve(null);

       
        const [
            relationshipPreference,
            interests,
            drinkFrequency,
            smokeFrequency,
            workoutFrequency,
            communicationStyle,
            loveReceive
        ] = await Promise.all([
            relationshipPromise,
            interestsPromise,
            drinkFrequencyPromise,
            smokeFrequencyPromise,
            workoutFrequencyPromise,
            communicationStylePromise,
            loveReceivePromise
        ]);

     
        if (!relationshipPreference) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Relationship preference not found."));
        }


        let userDetails = {
            username: user.username,
            age: user.dob,
            images: user.images,
            interests: interests?.map(i => i.interest) || null,
            drinkFrequency: drinkFrequency?.frequency || null,
            smokeFrequency: smokeFrequency?.frequency || null,
            workoutFrequency: workoutFrequency?.frequency || null,
            communicationStyle: communicationStyle?.style || null,
            loveReceive: loveReceive?.love_type || null
        };

        return res.status(200).json(successResponse("Details fetched successfully", userDetails));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.getTopPicks = async (req, res) => {
    try {
        const userId = req.result.userId;
        const user = await userModel.findById(userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong,"User not found with this user id."));
        }

        
        const preferredGender = user.intrested_to_see; 
        const maxDistance = user.preferences.distance_preference || 50;

        
        const nearbyUsers = await userModel.find({
            _id: { $ne: userId }, 
            gender: preferredGender === 'everyone' ? { $exists: true } : preferredGender,
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: user.location.coordinates },
                    $maxDistance: maxDistance * 1000, 
                }
            }
        });

       
        const matchedUsers = nearbyUsers.map(nearbyUser => {
        
            const score =  calculateMatchScore(user, nearbyUser);
            const userImage = nearbyUser.images.find(img => img.position === 1) || {};
            
            return {
                _id: nearbyUser._id,
                username: nearbyUser.username,
                age: nearbyUser.dob ? new Date().getFullYear() - new Date(nearbyUser.dob).getFullYear() : null, 
                image: userImage.url || null, 
                matchScore: score
            };
        });

        
        matchedUsers.sort((a, b) => b.matchScore - a.matchScore);

  
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
        res.status(500).json(errorResponse(messages.generalError.somethingWentWrong,error.message));
    }
}; 




