let config = require("../config/config")
let userModel = require("../models/userModel")
let { errorResponse, successResponse } = require("../utils/responseHandler")
let { generateToken, generateOtp, sendTwilioSms } = require("../utils/commonFunctions")
const uploadFile = require("../utils/aws_s3_image_uploader")





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

        return res.status(200).json({ message: `Verification code sent to this number ${mobile_number}.Valid for two minuites.`, type: 'success' });

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json({ message: error.message, type: "error" });
    }
};






exports.social_login = async (req, res) => {
    try {
        const { providerName, providerId, email, mobile_number } = req.body;

        let user = await userModel.findOne({ mobile_number });

        if (!user) {

            user = new userModel({
                mobile_number,
                email,
                completed_steps: [1],
                current_step: 1,
                socialLogin: [{ providerName, providerId }]
            });
            await user.save();
            return res.status(201).json({ message: 'Login successfull', user });
        }


        const existingProvider = user.socialLogin.find(login =>
            login.providerName === providerName && login.providerId === providerId
        );

        if (!existingProvider) {
            user.socialLogin.push({ providerName, providerId });
            await user.save();
        }

        if (user.current_step === 0) {
            user.email = email
            user.current_step = 1;
            user.completed_steps.push(1);

            await user.save();
        }

        return res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: error.message });
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

        return res.status(200).json({ message: 'OTP verified and user updated', type: 'success' });
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json({ message: error.message, type: 'error' });
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
            // if (!Array.isArray(images)) {
            //     return res.status(400).json({ type: "error", message: "please select atleast 2 images" })
            // }
            if (!images?.images || images?.images?.length === 0) {
                return res.status(400).json({ type: "error", message: "No images provided" });
            }

            const imageUrls = [];
            for (const [index, image] of images.images.entries()) {
                try {
                    if (!image.data) {
                        return res.status(400).json({ type: "error", message: "File data is missing." });
                    }
                    console.log(`Uploading image: ${image.name}`);

                    const uploadResult = await uploadFile({
                        name: image.name,
                        data: image.data,
                        mimetype: image.mimetype
                    });

                    console.log(`Upload result for ${image.name}: ${JSON.stringify(uploadResult)}`);
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
    const { id } = req.params;
    try {
        const user_detail = await userModel.findById(id)
        if (!user_detail) return res.status(400).json({ type: "error", message: "User not exist" })

        return res.status(200).json({
            type: "success",
            user_detail: user_detail
        })
    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        })
    }
}
