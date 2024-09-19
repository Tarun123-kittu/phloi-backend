let userModel = require("../models/userModel")
let matchModel = require("../models/matchesModel")
const matchAlgorithm = require("../utils/matchMaking")
let { sendTwilioSms } = require("../utils/commonFunctions")
const {errorResponse,successResponse} = require("../utils/responseHandler")
const messages = require("../utils/messages")
const io = require('../index')



exports.recommended_users = async (req,res)=>{

    const userId = req.result.userId;
    const maxDistance = parseInt(req.query.distance) || 100; 

    const currentUser = await userModel.findById(userId).lean();
    if (!currentUser) {
        return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,messages.notFound.userNotFound));
    }

    const matchedUsers = await matchAlgorithm(currentUser, maxDistance);
        return res.status(200).json({
        type: 'success',
        message: 'Users matched successfully',
        users: matchedUsers
    });
}




exports.like_profile = async(req,res)=>{
    const currentUserId = req.result.userId;    
    const likedUserId = req.query.likedUserId;

  
        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ type: 'error', message: 'Current user not found.' });
        }

      
        const likedUser = await userModel.findById(likedUserId);
        if (!likedUser) {
            return res.status(404).json({ type: 'error', message: 'User to be liked not found.' });
        }

       
        if (currentUser.likedUsers.includes(likedUserId)) {
            return res.status(400).json({ type: 'error', message: 'You have already liked this user.' });
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

            const currentUserPhone = currentUser.mobile_number;
            const likedUserPhone = likedUser.mobile_number;
            
            if (currentUserPhone && likedUserPhone) {
                const message = 'Congratulations! You have a new match!';
                await sendTwilioSms(message,currentUserPhone);
                await sendTwilioSms(message,likedUserPhone);
            }

            io.emit('its_a_match')

            return res.status(200).json({
                type: 'success',
                message: 'Mutual like! A new match has been created.',
            });
        }

        return res.status(200).json({
            type: 'success',
            message: 'User liked successfully.',
        });
}



exports.dislike_profile = async(req,res)=>{
    const currentUserId = req.result.userId; 
    const dislikedUserId = req.query.dislikedUserId;

    try {

        const currentUser = await userModel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ type: 'error', message: 'Current user not found.' });
        }

      
        const dislikedUser = await userModel.findById(dislikedUserId);
        if (!dislikedUser) {
            return res.status(404).json({ type: 'error', message: 'User to be disliked not found.' });
        }

       
        if (currentUser.dislikedUsers.includes(dislikedUserId)) {
            return res.status(400).json({ type: 'error', message: 'You have already disliked this user.' });
        }

       
        currentUser.dislikedUsers.push(dislikedUserId);
        await currentUser.save();

        return res.status(200).json({ type: 'success', message: 'User disliked successfully.' });
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json({ type: 'error', message: 'Internal server error.' });
    }   
};


exports.get_users_who_liked_profile = async (req, res) => {
    const loggedInUserId = req.result.userId;

    try {
        
        const usersWhoLikedProfile = await userModel.find({
            likedUsers: loggedInUserId
        })
        .select('_id username gender images') 
        .sort({ createdAt: -1 })
        .lean();

        if (usersWhoLikedProfile.length === 0) {
            return res.status(200).json({
                type: 'success',
                message: 'No users have liked your profile.',
                users: []
            });
        }

        return res.status(200).json({
            type: 'success',
            message: 'Users who liked your profile fetched successfully.',
            total_profiles:usersWhoLikedProfile.length,
            users: usersWhoLikedProfile

        });
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, 'Internal server error.'));
    }
};



