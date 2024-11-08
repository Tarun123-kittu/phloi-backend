let userModel = require('../models/userModel')
let secretDatingUserModel = require('../models/secretDatingUserModel')
let optionsModel = require("../models/optionsModel")
let avatarModel = require('../models/avatarsModel')
let { successResponse, errorResponse } = require('../utils/responseHandler')
let messages = require('../utils/messages')
let { uploadFile } = require('../utils/awsUpload')




exports.get_avatars = async (req, res) => {
    try {
        let allAvatars = await avatarModel.find().select('_id avatar_image').lean()
        return res.status(200).json(successResponse('Data retrieved', allAvatars))
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
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
                if (avatar && image) {
                    return res.status(400).json(errorResponse('You can only add one : Select avatar or upload image'))
                }
                if (!secret_name || !bio) {
                    return res.status(400).json(errorResponse('Secret name and bio are required'));
                }
                if (image) {
                    image.userId = userId
                    let data = await uploadFile(image, 'Secret Dating');
                    profileUpdateData.profile_image = data.Location
                }
                profileUpdateData.avatar = avatar || null;
                profileUpdateData.name = secret_name;
                profileUpdateData.bio = bio;
                break;

            case 2:
                if (!interested_in) { return res.status(400).json(errorResponse('Interested in field is required')); }
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
                if (!relationship_preference) { return res.status(400).json(errorResponse('Relationship preference is required.')); }
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

        return res.status(200).json(successResponse('Profile updated successfully', profile));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};














exports.get_secretDating_userDetails = async (req, res) => {
    try {
        let userId = req.result.userId;
        let TOTAL_STEPS = 4;


        let isUserExist = await userModel.findById(userId);
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User does not exist with this user ID'));
        }


        let secretDatingUser = await secretDatingUserModel.findOne({ user_id: userId });
        if (!secretDatingUser) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'This user does not exist in Secret Dating'));
        }


        const validSteps = secretDatingUser?.completed_steps.filter(step => step !== null);
        const completedStepCount = validSteps.length;
        const completionPercentage = ((completedStepCount / TOTAL_STEPS) * 100).toFixed(2);


        const orientationTexts = await optionsModel.find({
            _id: { $in: secretDatingUser.sexual_orientation_preference_id }
        }).select('text _id');

        const relationshipText = await optionsModel.findOne({
            _id: secretDatingUser.relationship_preference
        }).select('text _id');


        let details = {
            ...secretDatingUser.toObject(),
            profile_completion_percentage: completionPercentage,
            sexual_orientation_texts: orientationTexts,
            relationship_preference_text: relationshipText ? relationshipText.text : null,
            distance_preference: isUserExist.distance_preference,
            verified_profile: isUserExist.verified_profile,
            setting_details: isUserExist.setting,
        };

        return res.status(200).json(successResponse('Data retrieved successfully', details));
    } catch (error) {
        console.log('ERROR:: ', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.update_user_detals = async (req, res) => {
    try {
        let userId = req.result.userId
        let step = Number(req.body.step);
        let image = req.files?.image || null;
        const avatar = req.body.avatar || null;
        const secret_name = req.body.secret_name;
        const bio = req.body.bio
        const interested_in = req.body.interested_in;
        const sexual_orientation = req.body.sexual_orientation;
        const show_sexual_orientation = req.body.show_sexual_orientation;
        const relationship_preference = req.body.relationship_preference;



        if (![1.1, 1.2, 1.3, 2, 3, 4].includes(step)) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Invalid step. Step should be between 1 and 4.')) }

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User datat not exist with this user Id')) }

        let isUserInSecretDating = await secretDatingUserModel.findOne({ user_id: userId })
        if (!isUserInSecretDating) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User doesn't exist in secret dating")) }

        let updatedDocument
        let imageUrl
        switch (step) {

            case 1.1:
                if (!avatar && !image) {
                    return res.status(400).json(errorResponse('Please provide either avatar or image'))
                }
                if (avatar && image) {
                    return res.status(400).json(errorResponse('You can only add one : Select avatar or upload image'))
                }

                if (image) {
                    image.userId = userId
                    let data = await uploadFile(image, 'Secret Dating');
                    imageUrl = data.Location
                }
                updatedDocument = await secretDatingUserModel.findOneAndUpdate(
                    { user_id: userId },
                    {
                        $set: {
                            profile_image: imageUrl || null,
                            avatar: avatar
                        }
                    },
                    { new: true }
                );
                break;


            case 1.2:
                if (!secret_name || secret_name.trim() == '') {
                    return res.status(400).json(errorResponse('Please provide your secret name', 'Provide secret name in body(form-data)'))
                }
                updatedDocument = await secretDatingUserModel.findOneAndUpdate({ user_id: userId },
                    {
                        $set: {
                            name: secret_name
                        }
                    },
                    { new: true }
                )

                break;

            case 1.3:
                if (!bio || bio.trim() == '') {
                    return res.status(400).json(errorResponse('Please provide your bio', 'Provide bio in the body(form-data)'))
                }

                updatedDocument = await secretDatingUserModel.findOneAndUpdate({ user_id: userId },
                    {
                        $set: {
                            bio: bio
                        }
                    },
                    { new: true }
                )
                break;


            case 2:
                if (!interested_in || interested_in.trim() == '') {
                    return res.status(400).json(errorResponse('Please provide who are you interested in seeing', 'Prove interested_in field in body(form-data)'))
                }

                updatedDocument = await secretDatingUserModel.findOneAndUpdate({ user_id: userId },
                    {
                        $set: {
                            interested_to_see: interested_in
                        }
                    },
                    { new: true, runValidators: true }
                )
                break;


            case 3:

                updatedDocument = await secretDatingUserModel.findOneAndUpdate({ user_id: userId }, {
                    $set: {
                        sexual_orientation_preference_id: sexual_orientation ? sexual_orientation : [],
                        show_sexual_orientation: show_sexual_orientation ? show_sexual_orientation : false
                    }
                },
                    { new: true }
                )
                break;


            case 4:
                if (!relationship_preference || relationship_preference.trim == '') {
                    return res.status(400).json(errorResponse('Please select what are you looking for', 'Provide relationship_preference in body(form-data)'))
                }
                updatedDocument = await secretDatingUserModel.findOneAndUpdate({ user_id: userId },
                    {
                        $set: {
                            relationship_preference: relationship_preference
                        }
                    },
                    { new: true }
                )
                break;


            default:
                return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Invalid step provided"))

        }

        return res.status(200).json(successResponse('Profile updated successfully', updatedDocument))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




