let userModel = require("../models/userModel")

exports.create_user = async (req, res) => {
    const { mobile_number } = req.body;
    if (!mobile_number) return res.status(400).json({ type: "error", message: "Mobile number is required" })
    try {
        const is_user_exist = await userModel.findOne({ mobile_number });
        if (is_user_exist) return res.status(400).json({ type: "error", message: "There ia already a user with this mobile number please try with diffrent one" });

        const user_obj = {
            mobile_number,
            completed_steps: [1],
            current_step: 1
        }

        const newUser = await userModel.create(user_obj);
        if (!newUser) return res.status(400).json({ type: "error", message: "error while create user please try again later" })
        return res.status(201).json({ type: "success", message: "step 1 completed successfully" })
    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        })
    }
}

exports.user_registration_steps = async (req, res) => {
    const {
        username, dob, gender, intrested_to_see,
        sexual_orientation_preference_id, relationship_type_preference_id,
        study, distance_preference, communication_style_id, love_receive_id,
        drink_frequency_id, smoke_frequency_id, workout_frequency_id,
        interests_ids, mobile_number, current_step
    } = req.body;

    if (!mobile_number) return res.status(400).json({ type: "error", message: "Mobile is required" });

    try {
        const find_user_id = await userModel.findOne({ mobile_number });
        if (!find_user_id) return res.status(400).json({ type: "error", message: "This mobile number does not exist" });

        const userId = find_user_id._id;
        const completed_steps = find_user_id.completed_steps || [];
        const updatecharacteristics = {}
        const user_obj = {};
        const updateFields = {};

        if (current_step === 2) {
            user_obj["username"] = username;
            user_obj["current_step"] = current_step,
                completed_steps[1] = 2;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 3) {
            user_obj["dob"] = dob;
            user_obj["current_step"] = current_step,
                completed_steps[2] = 3;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 4) {
            user_obj["gender"] = gender;
            user_obj["current_step"] = current_step,
                completed_steps[3] = 4;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 5) {
            user_obj["intrested_to_see"] = intrested_to_see;
            user_obj["current_step"] = current_step,
                completed_steps[4] = 5;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 6) {
            updateFields["preferences.sexual_orientation_preference_id"] = sexual_orientation_preference_id;
            user_obj["current_step"] = current_step,
                completed_steps[5] = 6;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 7) {
            updateFields["preferences.relationship_type_preference_id"] = relationship_type_preference_id;
            user_obj["current_step"] = current_step,
                completed_steps[6] = 7;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 8) {
            user_obj["current_step"] = current_step,
                user_obj["study"] = study,
                completed_steps[7] = 8;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 9) {
            updateFields["preferences.distance_preference"] = distance_preference;
            user_obj["current_step"] = current_step,
                completed_steps[8] = 9;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 10) {
            updatecharacteristics["characteristics.communication_style_id"] = communication_style_id;
            updatecharacteristics["characteristics.love_receive_id"] = love_receive_id;
            user_obj["current_step"] = current_step,
                completed_steps[9] = 10;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 11) {
            updatecharacteristics["characteristics.drink_frequency_id"] = drink_frequency_id;
            updatecharacteristics["characteristics.smoke_frequency_id"] = smoke_frequency_id;
            updatecharacteristics["characteristics.workout_frequency_id"] = workout_frequency_id;
            user_obj["current_step"] = current_step,
                completed_steps[10] = 11;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step === 12) {
            updatecharacteristics["characteristics.interests_ids"] = interests_ids;
            user_obj["current_step"] = current_step,
                completed_steps[11] = 12;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step > 12) {
            return res.status(400).json({ type: "error", message: "Invalid step" })
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








