let userModel = require('../models/userModel')
let secretDatingUserModel = require('../models/secretDatingUserModel')
let avatarModel = require('../models/avatarsModel')
let { successResponse, errorResponse } = require('../utils/responseHandler')
let messages = require('../utils/messages')
let {uploadFile} = require('../utils/awsUpload')
let secretDatingMatchAlgorithm = require('../utils/secretDatingMatchMaking')



exports.get_avatars = async(req,res)=>{
    try{
    let allAvatars = await avatarModel.find().select('_id avatar_image').lean()
    return res.status(200).json(successResponse('Data retrieved',allAvatars))
    }catch(error){
        console.log('ERROR::',error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong,error.message))
    }
}



exports.switch_secretDating_mode = async (req, res) => {
    try {
        let userId = req.result.userId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this id")) }

        await userModel.findByIdAndUpdate(userId, {
            $set: {
                secret_dating_mode: isUserExist.secret_dating_mode == true ? false : true
            }
        })

        return res.status(200).json(successResponse(`Secret dating mode is ${isUserExist.secret_dating_mode == true ? 'turned off' : 'turned on'}`))
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




exports.secretDating_registration = async (req, res) => {
    try {
        const userId = req.result.userId;
        const step = Number(req.body.step); 
        let image = req.files?.image || null;
        const avatar = req.body.avatar;
        const secret_name = req.body.secret_name;
        const bio = req.body.bio;
        const interested_in = req.body.interested_in;
        const sexual_orientation = req.body.sexual_orientation;
        const show_sexual_orientation = req.body.show_sexual_orientation;
        const relationship_preference = req.body.relationship_preference;

       
        if (![1, 2, 3, 4].includes(step)) {
            return res.status(400).json({
                type: 'error',
                message: 'Invalid step. Step should be between 1 and 4.'
            });
        }

       
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this userId'));
        }

       
        let profile = await secretDatingUserModel.findOne({ user_id: userId });

     
        const profileUpdateData = {};

        
        switch (step) {
            case 1:
                if (!avatar && !image) {
                    return res.status(400).json(errorResponse('Please provide either avatar or image'));
                }
                if(avatar && image){
                    return res.status(400).json(errorResponse('You can only add one : Select avatar or upload image'))
                }
                if (!secret_name || !bio) {
                    return res.status(400).json(errorResponse('Secret name and bio are required'));
                }
                if (image) {
                    image.userId=userId
                    let data  = await uploadFile(image,'Secret Dating');
                    profileUpdateData.profile_image = data.Location
                }
                profileUpdateData.avatar = avatar || null;
                profileUpdateData.name = secret_name;
                profileUpdateData.bio = bio;
                break;

            case 2:
                if (!interested_in) {   return res.status(400).json(errorResponse('Interested in field is required')); }
                profileUpdateData.interested_to_see = interested_in;
                break;

            case 3:
                if (!sexual_orientation || typeof show_sexual_orientation === 'undefined') {
                    return res.status(400).json(errorResponse('Sexual orientation and show sexual orientation are required'));
                }
                profileUpdateData.sexual_orientation_preference_id = sexual_orientation;
                profileUpdateData.show_sexual_orientation = show_sexual_orientation;
                break;

            case 4:
                if (!relationship_preference) {  return res.status(400).json(errorResponse('Relationship preference is required.'));  }
                profileUpdateData.relationship_preference = relationship_preference;
                break;

            default:
                return res.status(400).json(errorResponse('Invalid step provided'));
        }

       
        profileUpdateData.current_step = step;

       
        if (!profile) {
            profileUpdateData.completed_steps = [step];
            profile = new secretDatingUserModel({
                user_id: userId,
                ...profileUpdateData
            });
        } else {
            
            profile.completed_steps = profile.completed_steps || [];
            if (!profile.completed_steps.includes(step)) {
                profile.completed_steps.push(step);
            }
            Object.assign(profile, profileUpdateData); 
        }

        
        await profile.save();
    
        return res.status(200).json(successResponse('Profile updated successfully',profile));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};







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
        const secretDatingCurrentUser= await secretDatingUserModel.findOne({user_id:currentUser._id})
  
        if (applyFilter == 'true' || applyFilter == true) {
            if (!ageMin || !ageMax || !maxDistance || !interestedIn || !show_verified_profiles) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide all the filter values to find match")) }
            show_verified_profiles = (show_verified_profiles ==='true')
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

        const matchedUsers = await secretDatingMatchAlgorithm(currentUser,secretDatingCurrentUser, page, limit, filterApplied);

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