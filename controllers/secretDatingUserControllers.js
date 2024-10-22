let userModel = require('../models/userModel')
let secretDatingUserModel = require('../models/secretDatingUserModel')
let { successResponse, errorResponse } = require('../utils/responseHandler')
let messages = require('../utils/messages')



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
        const image = req.file?.image || null;
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
                if (!secret_name || !bio) {
                    return res.status(400).json(errorResponse('Secret name and bio are required'));
                }
                if (image) {
                    profileUpdateData.profile_image = await uploadToS3(image);
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



