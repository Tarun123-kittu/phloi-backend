let config = require("../config/config")
let userModel = require("../models/userModel")
let { errorResponse, successResponse } = require("../utils/responseHandler")
let { generateToken, generateOtp, sendTwilioSms } = require("../utils/commonFunctions")
const {uploadFile,s3} = require("../utils/awsUpload")



exports.login = async (req, res) => {
    try {
        const { mobile_number } = req.body;

        const otp = await generateOtp();

        const currentTime = new Date();

        let user = await userModel.findOne({ mobile_number });

        if (user) {

            await userModel.findOneAndUpdate(
                { mobile_number },
                {
                    $set: { otp, otp_sent_at: currentTime }
                }
            );
        } else {

            await userModel.create({
                mobile_number,
                otp,
                otp_sent_at: currentTime,

            });
        }


        const smsResponse = await sendTwilioSms(mobile_number, otp);
        if (!smsResponse.success) {
            // return res.status(400).json({ message: 'Error sending verification code via SMS: ' + smsResponse.error, type: 'error' });
            console.log("error while sending sms")
        }

        return res.status(200).json(successResponse(`Verification code sent to this number ${mobile_number}.Valid for two minuites.`));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.social_login = async (req, res) => {
    try {
        const { providerName, providerId, email, mobile_number } = req.body;


        let user = await userModel.findOne({
            $or: [{ mobile_number }, { email }]
        });


        if (!user) {
            user = new userModel({
                mobile_number,
                email: email || null,
                completed_steps: [1],
                current_step: 1,
                socialLogin: [{ providerName, providerId }]
            });

            await user.save();
            return res.status(201).json(successResponse("Login successfull", user));
        }


        if (!user.email && email) {
            user.email = email;
            await user.save();
        }


        const existingProvider = user.socialLogin.find(
            login => login.providerName === providerName && login.providerId === providerId
        );


        if (!existingProvider) {
            user.socialLogin.push({ providerName, providerId });
            await user.save();
        }


        if (user.current_step === 0) {
            user.current_step = 1;
            if (!user.completed_steps.includes(1)) {
                user.completed_steps.push(1);
            }
            await user.save();
        }


        return res.status(200).json(successResponse("Login successful", user));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.verify_otp = async (req, res) => {
    try {
        const { mobile_number, otp } = req.body;

        let user = await userModel.findOne({ mobile_number });

        if (!user) {
            return res.status(404).json({ message: 'User not found', type: 'error' });
        }


        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP', type: 'error' });
        }

        const currentTime = new Date();
        const otpSentAt = user.otp_sent_at;
        const timeDifference = (currentTime - otpSentAt) / (1000 * 60);

        if (timeDifference > 2) {
            return res.status(400).json({ message: 'OTP has expired', type: 'error' });
        }

        if (user.current_step === 0) {

            await userModel.findOneAndUpdate(
                { mobile_number },
                {
                    $set: { current_step: 1, otp: null },
                    $push: { completed_steps: 1 }
                },
                { new: true }
            );

        } else {

            await userModel.findOneAndUpdate(
                { mobile_number },
                {
                    $set: { otp: null }
                }

            );
        }

        let token = await generateToken(user._id)

        return res.status(200).json(successResponse('Login successful.', token));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.user_registration_steps = async (req, res) => {
    const {
        username, dob, gender, intrested_to_see,
        sexual_orientation_preference_id, relationship_type_preference_id,
        study, distance_preference, communication_style_id, love_receive_id,
        drink_frequency_id, smoke_frequency_id, workout_frequency_id,
        interests_ids, mobile_number, current_step, location
    } = req.body;

    let parsedLocation = location;
    if (typeof location === 'string') {
        try {
            parsedLocation = JSON.parse(location);
        } catch (error) {
            return res.status(400).json({ type: "error", message: "Location must be a valid JSON object" });
        }
    }

    const images = req.files;
    console.log(images?.images)

    if (!mobile_number) return res.status(400).json({ type: "error", message: "Mobile is required" });

    try {
        const find_user_id = await userModel.findOne({ mobile_number });
        if (!find_user_id) return res.status(400).json({ type: "error", message: "This mobile number does not exist" });

        const userId = find_user_id._id;
        const completed_steps = find_user_id.completed_steps || [];
        const updatecharacteristics = {};
        const user_obj = {};
        const updateFields = {};

        console.log(interests_ids, "interests_ids")

        // Steps 2 - 12
        if (current_step == 2) {
            user_obj["username"] = username;
            user_obj["current_step"] = current_step;
            completed_steps[1] = 2;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 3) {
            user_obj["dob"] = dob;
            user_obj["current_step"] = current_step;
            completed_steps[2] = 3;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 4) {
            user_obj["gender"] = gender;
            user_obj["current_step"] = current_step;
            completed_steps[3] = 4;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 5) {
            user_obj["intrested_to_see"] = intrested_to_see;
            user_obj["current_step"] = current_step;
            completed_steps[4] = 5;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 6) {
            updateFields["preferences.sexual_orientation_preference_id"] = sexual_orientation_preference_id;
            user_obj["current_step"] = current_step;
            completed_steps[5] = 6;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 7) {
            updateFields["preferences.relationship_type_preference_id"] = relationship_type_preference_id;
            user_obj["current_step"] = current_step;
            completed_steps[6] = 7;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 8) {
            user_obj["study"] = study;
            user_obj["current_step"] = current_step;
            completed_steps[7] = 8;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 9) {
            updateFields["preferences.distance_preference"] = distance_preference;
            user_obj["current_step"] = current_step;
            completed_steps[8] = 9;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 10) {
            updatecharacteristics["characteristics.communication_style_id"] = communication_style_id;
            updatecharacteristics["characteristics.love_receive_id"] = love_receive_id;
            user_obj["current_step"] = current_step;
            completed_steps[9] = 10;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 11) {
            updatecharacteristics["characteristics.drink_frequency_id"] = drink_frequency_id;
            updatecharacteristics["characteristics.smoke_frequency_id"] = smoke_frequency_id;
            updatecharacteristics["characteristics.workout_frequency_id"] = workout_frequency_id;
            user_obj["current_step"] = current_step;
            completed_steps[10] = 11;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 12) {
            updatecharacteristics["characteristics.interests_ids"] = interests_ids;
            user_obj["current_step"] = current_step;
            completed_steps[11] = 12;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step == 13) {
            if (!images?.images || images?.images?.length === 0) {
                return res.status(400).json(errorResponse("No images provided"));
            }

            const imageUrls = [];
            for (const [index, image] of images.images.entries()) {
                try {
                    if (!image.data) {
                        return res.status(400).json(errorResponse("File data is missing."));
                    }

                    const uploadResult = await uploadFile({
                        name: image.name,
                        data: image.data,
                        mimetype: image.mimetype
                    });
                    imageUrls.push({
                        url: uploadResult.Location,
                        position: index + 1
                    });
                } catch (error) {
                    console.error(`Error uploading image ${image.name}: ${error.message}`); // Debug log
                    return res.status(500).json({ type: "error", message: `Error uploading image: ${error.message}` });
                }
            }
            user_obj["images"] = imageUrls;
        }

        if (current_step == 14) {
            user_obj["location"] = parsedLocation;
            user_obj["current_step"] = current_step;
            completed_steps[13] = 14;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step > 14) {
            return res.status(400).json({ type: "error", message: "Invalid step" });
        }

        Object.assign(user_obj, updateFields, updatecharacteristics);

        const user_registration_flow = await userModel.findByIdAndUpdate(userId, user_obj, { new: true, runValidators: true });

        if (!user_registration_flow) {
            return res.status(400).json({ type: "error", message: `Error while updating step ${current_step}. Please try again later.` });
        }

        return res.status(200).json({
            type: "success",
            message: `Step ${current_step} updated successfully`
        });

    } catch (error) {
        console.error('Update error:', error);
        return res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};



exports.get_user_details = async (req, res) => {
    const id = req.result.userId;
    const TOTAL_STEPS = 14;

    try {
        const user_detail = await userModel.findById(id);
        if (!user_detail) return res.status(400).json({ type: "error", message: "User does not exist" });

        const { completed_steps = [] } = user_detail;
        const completedStepCount = completed_steps.length;


        const completionPercentage = (completedStepCount / TOTAL_STEPS) * 100;

        return res.status(200).json({
            type: "success",
            user_detail: user_detail,
            profile_completion_percentage: completionPercentage.toFixed(2)
        });
    } catch (error) {
        console.log('ERROR::', error);
        return res.status(400).json({ type: "error", message: error.message });
    }
};



exports.update_image_position = async (req, res) => {

    const userId = req.result.userId

    const { fromPosition, toPosition } = req.body;

    try {
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        const fromImage = user.images.find(img => img.position === fromPosition);

        if (!fromImage) {
            return res.status(400).json({ error: 'Invalid fromPosition' });
        }


        if (fromPosition < toPosition) {

            user.images.forEach(img => {
                if (img.position > fromPosition && img.position <= toPosition) {
                    img.position -= 1;
                }
            });
        } else if (fromPosition > toPosition) {

            user.images.forEach(img => {
                if (img.position >= toPosition && img.position < fromPosition) {
                    img.position += 1;
                }
            });
        }

        fromImage.position = toPosition;

        await user.save();
        const sortedImages = user.images.sort((a, b) => a.position - b.position);

        res.status(200).json(sortedImages);

    } catch (err) {
        console.error('Error updating image positions:', err);
        res.status(500).json({ error: 'Error updating image positions' });
    }
}


const stepFieldMappings = {
    2: ['username'],
    3: ['dob'],
    4: ['gender'],
    5: ['intrested_to_see'],
    6: ['sexual_orientation_preference_id'],
    7: ['relationship_type_preference_id'],
    8: ['study'],
    9: ['distance_preference'],
    10: ['communication_style_id', 'love_receive_id'],
    11: ['drink_frequency_id', 'smoke_frequency_id', 'workout_frequency_id'],
    12: ['interests_ids']
};


exports.update_user_profile = async (req, res) => {

    let userId = req.result.userId;

    const {
        username, dob, gender, intrested_to_see,
        sexual_orientation_preference_id, relationship_type_preference_id,
        study, distance_preference, communication_style_id, love_receive_id,
        drink_frequency_id, smoke_frequency_id, workout_frequency_id,
        interests_ids, current_step
    } = req.body;

    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(400).json({ type: "error", message: "User does not exist" });

        const { completed_steps = [] } = user;

        const getLastValidValue = (step) => {
            const lastValidStep = completed_steps[step - 1];
            if (lastValidStep) {
                switch (step) {
                    case 2: return user.username;
                    case 3: return user.dob;
                    case 4: return user.gender;
                    case 5: return user.intrested_to_see;
                    case 6: return user.preferences.sexual_orientation_preference_id;
                    case 7: return user.preferences.relationship_type_preference_id;
                    case 8: return user.study;
                    case 9: return user.preferences.distance_preference;
                    case 10: return { communication_style_id: user.characteristics.communication_style_id, love_receive_id: user.characteristics.love_receive_id };
                    case 11: return { drink_frequency_id: user.characteristics.drink_frequency_id, smoke_frequency_id: user.characteristics.smoke_frequency_id, workout_frequency_id: user.characteristics.workout_frequency_id };
                    case 12: return user.characteristics.interests_ids;
                    default: return null;
                }
            }
            return null;
        };


        if (!stepFieldMappings[current_step]) {
            return res.status(400).json({ type: "error", message: "Invalid step" });
        }


        const requiredFields = stepFieldMappings[current_step];
        const providedFields = Object.keys(req.body).filter(key => key !== 'current_step');
        const invalidFields = providedFields.filter(field => !requiredFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ type: "error", message: `Invalid fields for step ${current_step}: ${invalidFields.join(', ')}` });
        }

        const updateFields = {};

        const updateStep = (step, fieldName, value) => {
            if (value === undefined) {
                const lastValidValue = getLastValidValue(step);
                if (lastValidValue === null) {
                    return res.status(400).json({ type: "error", message: `${fieldName} is required for step ${step}` });
                }
                updateFields[fieldName] = lastValidValue;
            } else {
                updateFields[fieldName] = value;
            }
        };

        switch (current_step) {
            case 2: updateStep(2, 'username', username); break;
            case 3: updateStep(3, 'dob', dob); break;
            case 4: updateStep(4, 'gender', gender); break;
            case 5: updateStep(5, 'intrested_to_see', intrested_to_see); break;
            case 6: updateStep(6, 'preferences.sexual_orientation_preference_id', sexual_orientation_preference_id); break;
            case 7: updateStep(7, 'preferences.relationship_type_preference_id', relationship_type_preference_id); break;
            case 8: updateStep(8, 'study', study); break;
            case 9: updateStep(9, 'preferences.distance_preference', distance_preference); break;
            case 10:
                updateStep(10, 'characteristics.communication_style_id', communication_style_id);
                updateStep(10, 'characteristics.love_receive_id', love_receive_id);
                break;
            case 11:
                updateStep(11, 'characteristics.drink_frequency_id', drink_frequency_id);
                updateStep(11, 'characteristics.smoke_frequency_id', smoke_frequency_id);
                updateStep(11, 'characteristics.workout_frequency_id', workout_frequency_id);
                break;
            case 12:
                if (!Array.isArray(interests_ids)) {
                    const lastInterests = getLastValidValue(12);
                    if (!lastInterests) return res.status(400).json({ type: "error", message: "Interests IDs must be an array for step 12" });
                    updateFields['characteristics.interests_ids'] = lastInterests;
                } else {
                    updateFields['characteristics.interests_ids'] = interests_ids;
                }
                break;
            default: return res.status(400).json({ type: "error", message: "Invalid step" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(400).json({ type: "error", message: `Error while updating step ${current_step}. Please try again later.` });
        }

        return res.status(200).json({
            type: "success",
            message: `Step ${current_step} updated successfully`,
            user: updatedUser
        });

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(error.message));
    }
};


exports.add_profile_images = async(req,res)=>{
    try{
        
        const userId = req.result.userId;
        const newImagesFromFrontend = req.files?.images;
        
        
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(400).json(errorResponse("User does not exist"));
            }
    
           
            let imagesArray = user.images || [];
           
         
            if (newImagesFromFrontend) {
                const uploadedImages = Array.isArray(newImagesFromFrontend) ? newImagesFromFrontend : [newImagesFromFrontend];
                for (const imageFile of uploadedImages) {
                    const uploadedImage = await uploadFile(imageFile); 
                    imagesArray.push({
                        url: uploadedImage.Location, 
                        position: imagesArray.length + 1,
                    });
                }
            }
    
          
            if (imagesArray.length < 2) {
                return res.status(400).json(errorResponse("You need to add at least two images."));
            }
    
    
            user.images = imagesArray;
            await user.save();
    
            return res.status(200).json({
                type: "success",
                message: "User images updated successfully",
                images: user.images,
            });
    
    }catch(error){
        console.log("ERROR::",error)
        return res.status(500).json(errorResponse(error.message))
    }
}


exports.delete_profile_image = async(req,res)=>{
    try{
        const userId = req.result.userId;
        const imageUrl  = req.body.imageUrl;

            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(400).json(errorResponse('User does not exist'));
            }

            let imagesArray = user.images || [];
            const imageIndex = imagesArray.findIndex(img => img.url === imageUrl);
    
            if (imageIndex === -1) {
                return res.status(404).json(errorResponse("Image not found."));
            }
    
          
            const [removedImage] = imagesArray.splice(imageIndex, 1);
    
          
            const params = {
                Bucket: 'phloii', 
                Key: removedImage.url.split('profile-images/')[1], 
            };
    
            await s3.deleteObject(params).promise(); 
    
       
            imagesArray = imagesArray.map((img, index) => ({
                ...img,
                position: index + 1,
            }));
    
         
            user.images = imagesArray;
            await user.save();
    
          
            if (user.images.length < 2) {
                return res.status(400).json(errorResponse("You need to have at least two images in your profile."))
            }
    
            return res.status(200).json({
                type: "success",
                message: "Image deleted successfully",
                images: user.images,
            });
    
    }catch(error){
        console.log("ERROR::",error)
        return res.status(500).json(errorResponse(error.message))
    }
}