let userModel = require("../models/userModel")
let { errorResponse, successResponse } = require("../utils/responseHandler")
let { generateToken, generateOtp, sendTwilioSms } = require("../utils/commonFunctions")
let messages = require("../utils/messages")
const { uploadFile, s3 } = require("../utils/awsUpload")
let userCharactersticsOptionsModel = require('../models/optionsModel')
const headingsModel = require("../models/headingsModel")
const questionsModel = require("../models/questionsModel")








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
                likedUsers: [],
                dislikedUsers: []

            });
        }

        const smsResponse = await sendTwilioSms(`Your phloii verification code is ${otp}`, mobile_number);
        if (!smsResponse.success) {
            // return res.status(400).json({ message: 'Error sending verification code via SMS: ' + smsResponse.error, type: 'error' });
            console.log("error while sending sms")
        } else {
            console.log("Response from twilio:::: success--" + smsResponse.success)
        }

        return res.status(200).json(successResponse(`Verification code sent to this number ${mobile_number}.Valid for two minuites.`));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
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
            return res.status(201).json(successResponse(messages.success.loginSuccessful, user));
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


        return res.status(200).json(successResponse(messages.success.loginSuccessful, user));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};








exports.verify_otp = async (req, res) => {
    try {
        const { mobile_number, otp } = req.body;

        let user = await userModel.findOne({ mobile_number });

        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }


        if (user.otp !== otp) {
            return res.status(400).json(errorResponse('Incorrect OTP'));
        }

        const currentTime = new Date();
        const otpSentAt = user.otp_sent_at;
        const timeDifference = (currentTime - otpSentAt) / (1000 * 60);

        if (timeDifference > 2) {
            return res.status(400).json(errorResponse("OTP has expired"));
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

        await userModel.findOneAndUpdate({ mobile_number: mobile_number }, {
            $set: {
                token: token
            }
        })

        return res.status(200).json(successResponse(messages.success.loginSuccessful, token));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};








exports.user_registration_steps = async (req, res) => {
    let id = req.result.userId
    const {
        email,
        username, dob, gender, intrested_to_see,
        sexual_orientation_preference_id, relationship_type_preference_id,
        study, distance_preference, current_step, location, show_gender, show_sexual_orientation, step_11_answer, step_12_answer, step_13_answers
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (current_step < 2 || current_step === undefined) {
        return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please enter correct step"))
    }


    let parsedLocation = location;
    if (typeof location === 'string') {
        try {
            parsedLocation = JSON.parse(location);
        } catch (error) {
            return res.status(400).json(errorResponse("Location must be a valid JSON object"));
        }
    }

    const images = req.files;

    try {
        const find_user_id = await userModel.findById(id);

        if (!find_user_id) return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));

        const userId = find_user_id._id;
        const completed_steps = find_user_id.completed_steps || [];
        const updatecharacteristics = {};
        const user_obj = {};
        const updateFields = {};


        // Steps 2 - 14
        if (current_step == 2) {
            if (!email) { return res.status(400).json(errorResponse('Email is required.', 'email is required to complete step 2')) }
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Please provide a valid email address.'
                });
            }
            user_obj["email"] = email;
            user_obj["current_step"] = current_step;
            completed_steps[1] = 2;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 3) {
            if (!username) { return res.status(400).json(errorResponse('Username is required.', 'username is required to complete step 3')) }
            user_obj["username"] = username;
            user_obj["current_step"] = current_step;
            completed_steps[2] = 3;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 4) {
            if (!dob) { return res.status(400).json(errorResponse('Date of birth is required.', 'dob is required to complete step 4')) }
            user_obj["dob"] = dob;
            user_obj["current_step"] = current_step;
            completed_steps[3] = 4;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 5) {
            if (!gender) {
                return res.status(400).json(errorResponse('Gender is required.', 'gender is required to complete step 5'));
            }
            user_obj["show_gender"] = show_gender;
            user_obj["gender"] = gender;
            user_obj["current_step"] = current_step;
            completed_steps[4] = 5;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 6) {
            if (!intrested_to_see) { return res.status(400).json(errorResponse('Interested to see is required.', 'interested to see is required to complete step 6')) }
            user_obj["intrested_to_see"] = intrested_to_see;
            user_obj["current_step"] = current_step;
            completed_steps[5] = 6;
            updateFields["completed_steps"] = completed_steps;
        }
        if (current_step == 7) {
            if (!sexual_orientation_preference_id) {
                return res.status(400).json(errorResponse('Sexual orientation is required.', 'Sexual orientation is required to complete step 7'));
            }

            const idsToCheck = Array.isArray(sexual_orientation_preference_id) ? sexual_orientation_preference_id : [sexual_orientation_preference_id];


            const existingOptions = await userCharactersticsOptionsModel.find({
                _id: { $in: idsToCheck }
            });


            const existingIds = existingOptions.map(option => option._id.toString());


            const invalidIds = idsToCheck.filter(id => !existingIds.includes(id));


            if (invalidIds.length > 0) {
                return res.status(400).json(errorResponse("Something went wrong", 'Invalid sexual orientation ID(s)'))
            }

            user_obj["show_sexual_orientation"] = show_sexual_orientation;
            updateFields["sexual_orientation_preference_id"] = existingIds;

            user_obj["current_step"] = current_step;
            completed_steps[6] = 7;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step == 8) {

            if (!relationship_type_preference_id) {
                return res.status(400).json(errorResponse('What are you looking for is required.', 'Relationship preferences are required to complete step 8.'));
            }
            const existingRelationshipOption = await userCharactersticsOptionsModel.findById(relationship_type_preference_id);


            if (!existingRelationshipOption) {
                return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'The provided relationship type preference ID does not exist.'));
            }


            updateFields["relationship_type_preference_id"] = relationship_type_preference_id;
            user_obj["current_step"] = current_step;
            completed_steps[7] = 8;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step == 9) {
            if (!study) { return res.status(400).json(errorResponse('Studying is your thing is required.', 'study is required to complete step 9')) }
            user_obj["study"] = study;
            user_obj["current_step"] = current_step;
            completed_steps[8] = 9;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step == 10) {
            if (!distance_preference) { return res.status(400).json(errorResponse('Distance preference is required.', 'distance preference is required to complete step 10')) }
            updateFields["distance_preference"] = distance_preference;
            user_obj["current_step"] = current_step;
            completed_steps[9] = 10;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step == 11) {


            if (!step_11_answer || !Array.isArray(step_11_answer) || step_11_answer.length === 0) {
                return res.status(400).json(errorResponse('Please add fields', 'Step 11 answers are required.'));
            }


            const validOptions = await userCharactersticsOptionsModel.find({}, 'question_id _id').lean();

            const validPairs = validOptions.map(option => ({
                questionId: option.question_id.toString(),
                answerId: option._id.toString()
            }));




            const invalidAnswers = step_11_answer.filter(answer =>
                !validPairs.some(validPair =>

                    validPair.questionId === answer.questionId && validPair.answerId === answer.answerId
                )
            );


            if (invalidAnswers.length > 0) {
                return res.status(400).json(errorResponse('Invalid questionId or answerId', 'One or more questionId-answerId pairs are invalid.'));
            }


            find_user_id.user_characterstics.step_11 = step_11_answer.map(answer => ({
                questionId: answer.questionId,
                answerId: answer.answerId
            }));

            find_user_id.current_step = current_step;
            completed_steps[10] = 11;
            find_user_id.completed_steps = completed_steps;


            await find_user_id.save();

            return res.status(200).json({
                type: "success",
                message: "Data added successfully",
                data: null
            });
        }

        if (current_step == 12) {
            if (!step_12_answer || !Array.isArray(step_12_answer) || step_12_answer.length === 0) {
                return res.status(400).json(errorResponse('Please add lifestyles', 'Step 12 answers are required.'));
            }


            const validOptions = await userCharactersticsOptionsModel.find({}, 'question_id _id').lean();
            const validPairs = validOptions.map(option => ({
                questionId: option.question_id.toString(),
                answerId: option._id.toString()
            }));


            const invalidAnswers = step_12_answer.filter(answer =>
                !validPairs.some(validPair =>
                    validPair.questionId === answer.questionId && validPair.answerId === answer.answerId
                )
            );


            if (invalidAnswers.length > 0) {
                return res.status(400).json(errorResponse('Invalid questionId or answerId', 'One or more questionId-answerId pairs are invalid.'));
            }


            find_user_id.user_characterstics.step_12 = [
                ...find_user_id.user_characterstics.step_12,
                ...step_12_answer.map(answer => ({
                    questionId: answer.questionId,
                    answerId: answer.answerId
                }))
            ];

            find_user_id.current_step = current_step;
            completed_steps[11] = 12;
            find_user_id.completed_steps = completed_steps;


            await find_user_id.save();

            return res.status(200).json({
                type: "success",
                message: "User characteristics updated successfully for step 12",
                data: null
            });
        }

        if (current_step == 13) {
            if (!step_13_answers || !Array.isArray(step_13_answers) || step_13_answers.length === 0) {
                return res.status(400).json(errorResponse('Please enter the interests', 'Step 13 answers are required.'));
            }


            const validOptions = await userCharactersticsOptionsModel.find({}, 'question_id _id').lean();


            const validPairs = validOptions.map(option => ({
                questionId: option.question_id.toString(),
                answerId: option._id.toString()
            }));


            const invalidAnswers = step_13_answers.filter(answer => {

                const validForQuestion = validPairs.filter(pair => pair.questionId === answer.questionId);


                return answer.answerIds.some(answerId => !validForQuestion.some(pair => pair.answerId === answerId));
            });


            if (invalidAnswers.length > 0) {
                return res.status(400).json(errorResponse('Invalid question or answerId(s)', 'One or more questionId or answerId(s) are invalid.'));
            }


            find_user_id.user_characterstics.step_13 = step_13_answers.map(answer => ({
                questionId: answer.questionId,
                answerIds: answer.answerIds
            }));

            find_user_id.current_step = current_step;
            completed_steps[12] = 13;
            find_user_id.completed_steps = completed_steps;


            await find_user_id.save();

            return res.status(200).json({
                type: "success",
                message: "User characteristics updated successfully for step 13",
                data: null
            });
        }


        if (current_step == 14) {

            let imageList = images?.images ? (Array.isArray(images.images) ? images.images : [images.images]) : [];


            if (imageList.length < 2) {
                return res.status(400).json(errorResponse("At least two images are required"));
            }

            const imageUrls = [];
            for (const [index, image] of imageList.entries()) {
                try {
                    if (!image.data) {
                        return res.status(400).json(errorResponse("File data is missing."));
                    }

                    const uploadResult = await uploadFile({
                        name: image.name,
                        data: image.data,
                        mimetype: image.mimetype,
                        userId: id
                    });

                    imageUrls.push({
                        url: uploadResult.Location,
                        position: index + 1
                    });
                } catch (error) {
                    console.error(`Error uploading image ${image.name}: ${error.message}`);
                    return res.status(500).json(errorResponse(`Error uploading image: ${error.message}`));
                }
            }

            user_obj["images"] = imageUrls;
            user_obj["current_step"] = current_step;
            completed_steps[13] = 14;
            updateFields["completed_steps"] = completed_steps;
        }


        if (current_step == 15) {
            if (!parsedLocation) return res.status(400).json(errorResponse("Location in required.", "Location is required for step 15"));
            user_obj["location"] = parsedLocation;
            user_obj["current_step"] = current_step;
            completed_steps[14] = 15;
            updateFields["completed_steps"] = completed_steps;
        }

        if (current_step > 15) {
            return res.status(400).json(errorResponse(messages.validation.invalidStep));
        }

        Object.assign(user_obj, updateFields, updatecharacteristics);

        const user_registration_flow = await userModel.findByIdAndUpdate(userId, user_obj, { new: true, runValidators: true });

        if (!user_registration_flow) {
            return res.status(400).json(errorResponse(`Error while updating step ${current_step}. Please try again later.`));
        }

        return res.status(200).json(successResponse(`Step ${current_step} updated successfully`));

    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};









exports.get_user_details = async (req, res) => {
    const id = req.result.userId;
    const TOTAL_STEPS = 15;

    try {
        // Fetch the user details
        const user_detail = await userModel.findById(id).lean();

        // Check if the user exists
        if (!user_detail) return res.status(400).json({ type: "error", message: "User does not exist" });

        // Get completed steps
        const { completed_steps = [], user_characterstics, sexual_orientation_preference_id, relationship_type_preference_id } = user_detail;
        const completedStepCount = completed_steps.length;
        const completionPercentage = (completedStepCount / TOTAL_STEPS) * 100;

        // Populate user_characterstics with actual text for questions and answers
        for (const step in user_characterstics) {
            if (user_characterstics.hasOwnProperty(step)) {
                for (const characteristic of user_characterstics[step]) {
                    const question = await questionsModel.findById(characteristic.questionId).lean();
                    const answer = await userCharactersticsOptionsModel.findById(characteristic.answerId).lean();

                    // Attach text and identify_text to the characteristic
                    characteristic.questionText = question ? question.text : null;
                    characteristic.answerText = answer ? answer.text : null;
                    characteristic.identifyText = question ? question.identify_text : null;  // Adding identify_text

                    // Handle multiple answers for step 13
                    if (characteristic.answerIds) {
                        characteristic.answerTexts = await userCharactersticsOptionsModel.find({
                            _id: { $in: characteristic.answerIds }
                        }).lean();
                    }
                }
            }
        }

        // Fetch sexual orientation options and structure as { id: value }
        const sexualOrientationOptions = await userCharactersticsOptionsModel.find({
            _id: { $in: sexual_orientation_preference_id }
        }).lean();

        const sexualOrientationPreferences = sexualOrientationOptions.map(option => ({
            id: option._id,
            value: option.text
        }));

        // Fetch relationship type option
        const relationshipTypeOption = await userCharactersticsOptionsModel.findById(relationship_type_preference_id).lean();
        const relationshipTypePreference = relationshipTypeOption ? {
            id: relationshipTypeOption._id,
            value: relationshipTypeOption.text
        } : null;

        // Attach the fetched options to the user detail
        user_detail.sexual_orientation_preference_id = sexualOrientationPreferences;
        user_detail.relationship_type_preference_id = relationshipTypePreference;

        return res.status(200).json({
            type: "success",
            user_detail: {
                ...user_detail,
                user_characterstics,
            },
            profile_completion_percentage: completionPercentage.toFixed(2)
        });
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json({ type: "error", message: "Something went wrong", error: error.message });
    }
};













exports.update_image_position = async (req, res) => {

    const userId = req.result.userId

    const { fromPosition, toPosition } = req.body;

    try {
        let user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }


        const fromImage = user.images.find(img => img.position === fromPosition);

        if (!fromImage) {
            return res.status(400).json(errorResponse('Invalid fromPosition'));
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
        res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}





const stepFieldMappings = {
    2: ['email'],
    3: ['username'],
    4: ['dob'],
    5: ['gender', 'show_gender'],
    6: ['intrested_to_see'],
    7: ['sexual_orientation_preference_id', 'show_sexual_orientation'],
    8: ['relationship_type_preference_id'],
    9: ['study'],
    10: ['distance_preference'],
    11: ['step_11_answer'],
    12: ['step_12_answer'],
    13: ['step_13_answers']
};

exports.update_user_profile = async (req, res) => {
    let userId = req.result.userId;

    let {
        email,
        username,
        dob,
        gender,
        intrested_to_see,
        sexual_orientation_preference_id,
        relationship_type_preference_id,
        study,
        distance_preference,
        current_step,
        show_gender,
        show_sexual_orientation,
        step_11_answer,
        step_12_answer,
        step_13_answers
    } = req.body;

    current_step = Number(current_step);

    try {
        const user = await userModel.findById(userId);
        console.log(user)
        if (!user) return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));

        const { completed_steps = [] } = user;

        const getLastValidValue = (step, fieldName) => {
            const lastValidStep = completed_steps[step - 1];
            if (lastValidStep) {
                switch (step) {
                    case 2: return user.email;
                    case 3: return user.username;
                    case 4: return user.dob;
                    case 5:
                        if (fieldName === 'gender') return user.gender;
                        if (fieldName === 'show_gender') return user.show_gender;
                    case 6: return user.intrested_to_see;
                    case 7:
                        if (fieldName === 'sexual_orientation_preference_id') return user.sexual_orientation_preference_id;
                        if (fieldName === 'show_sexual_orientation') return user.show_sexual_orientation;
                        break;
                    case 8: return user.relationship_type_preference_id;
                    case 9: return user.study;
                    case 10: return user.distance_preference;
                    case 11: return user.user_characterstics.step_11 || [];
                    case 12: return user.user_characterstics.step_12 || [];
                    case 13: return user.user_characterstics.step_13 || [];
                    default: return null;
                }
            }
            return null;
        };

        if (!stepFieldMappings[current_step]) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.validation.invalidStep));
        }

        const requiredFields = stepFieldMappings[current_step];


        const providedFields = Object.keys(req.body).filter(key => key !== 'current_step');
        const invalidFields = providedFields.filter(field => !requiredFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, `Invalid fields for step ${current_step}: ${invalidFields.join(', ')}`));
        }

        const updateFields = {};

        const updateStep = (step, fieldName, value) => {

            if (value === undefined) {

                const lastValidValue = getLastValidValue(step, fieldName);

                if (lastValidValue === null) {
                    return res.status(400).json(errorResponse(`${fieldName} is required for step ${step}`));
                }
                updateFields[fieldName] = lastValidValue;
            } else {
                updateFields[fieldName] = value;
            }
        };

        switch (current_step) {
            case 2: updateStep(2, 'email', email); break;
            case 3: updateStep(3, 'username', username); break;
            case 4: updateStep(4, 'dob', dob); break;
            case 5:
                updateStep(5, 'gender', gender);
                updateStep(5, 'show_gender', show_gender);
                break;
            case 6: updateStep(6, 'intrested_to_see', intrested_to_see); break;
            case 7:
                updateStep(7, 'sexual_orientation_preference_id', sexual_orientation_preference_id);
                updateStep(7, 'show_sexual_orientation', show_sexual_orientation);
                break;
            case 8: updateStep(8, 'relationship_type_preference_id', relationship_type_preference_id); break;
            case 9: updateStep(9, 'study', study); break;
            case 10: updateStep(10, 'distance_preference', distance_preference); break;
            case 11:
                if (Array.isArray(step_11_answer) && step_11_answer.length > 0) {
                    const validOptions = await userCharactersticsOptionsModel.find({}, 'question_id _id').lean();

                    const validPairs = validOptions.map(option => ({
                        questionId: option.question_id.toString(),
                        answerId: option._id.toString()
                    }));

                    const invalidAnswers = step_11_answer.filter(answer =>
                        !validPairs.some(validPair =>

                            validPair.questionId === answer.questionId && validPair.answerId === answer.answerId
                        )
                    );

                    if (invalidAnswers.length > 0) {
                        return res.status(400).json(errorResponse('Invalid questionId or answerId', 'One or more questionId-answerId pairs are invalid.'));
                    }
                    updateFields['user_characterstics.step_11'] = step_11_answer;
                } else {
                    updateFields['user_characterstics.step_11'] = getLastValidValue(11);
                }
                break;
            case 12:
                if (Array.isArray(step_12_answer) && step_12_answer.length > 0) {


                    const validOptions = await userCharactersticsOptionsModel.find({}, 'question_id _id').lean();
                    const validPairs = validOptions.map(option => ({
                        questionId: option.question_id.toString(),
                        answerId: option._id.toString()
                    }));


                    const invalidAnswers = step_12_answer.filter(answer =>
                        !validPairs.some(validPair =>
                            validPair.questionId === answer.questionId && validPair.answerId === answer.answerId
                        )
                    );


                    if (invalidAnswers.length > 0) {
                        return res.status(400).json(errorResponse('Invalid questionId or answerId', 'One or more questionId-answerId pairs are invalid.'));
                    }

                    updateFields['user_characterstics.step_12'] = step_12_answer;
                } else {

                    updateFields['user_characterstics.step_12'] = getLastValidValue(12);
                }
                break;
            case 13:
                if (Array.isArray(step_13_answers) && step_13_answers.length > 0) {

                    const validOptions = await userCharactersticsOptionsModel.find({}, 'question_id _id').lean();


                    const validPairs = validOptions.map(option => ({
                        questionId: option.question_id.toString(),
                        answerId: option._id.toString()
                    }));


                    const invalidAnswers = step_13_answers.filter(answer => {

                        const validForQuestion = validPairs.filter(pair => pair.questionId === answer.questionId);


                        return answer.answerIds.some(answerId => !validForQuestion.some(pair => pair.answerId === answerId));
                    });


                    if (invalidAnswers.length > 0) {
                        return res.status(400).json(errorResponse('Invalid question or answerId(s)', 'One or more questionId or answerId(s) are invalid.'));
                    }


                    updateFields['user_characterstics.step_13'] = step_13_answers;
                } else {
                    updateFields['user_characterstics.step_13'] = getLastValidValue(13);
                }
                break;
            default: return res.status(400).json(errorResponse(messages.validation.invalidStep));
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(400).json({ type: "error", message: `Error while updating step ${current_step}. Please try again later.` });
        }

        return res.status(200).json(successResponse(`Step ${current_step} updated successfully`, updatedUser));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};









exports.update_user_setting = async (req, res) => {
    try {
        const { user_id, distance_in, read_receipts } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        if (!distance_in && read_receipts === undefined) {
            return res.status(400).json({ error: "At least one setting field (distance_in or read_receipts) is required" });
        }

        const setting_obj = {};
        if (distance_in) {
            if (!['km', 'mi'].includes(distance_in)) {
                return res.status(400).json({ error: "Invalid value for distance_in. Allowed values are 'km' or 'mi'" });
            }
            setting_obj["setting.distance_in"] = distance_in;
        }
        if (read_receipts !== undefined) {
            setting_obj["setting.read_receipts"] = read_receipts;
        }


        const user_setting = await userModel.findByIdAndUpdate(
            user_id,
            { $set: setting_obj },
            { new: true, runValidators: true }
        );

        if (!user_setting) {
            return res.status(404).json({ error: "User not found or could not update settings" });
        }

        return res.status(200).json({
            message: "Settings updated successfully"
        });

    } catch (error) {
        console.error("Error updating user settings:", error);
        return res.status(500).json({ error: "An internal server error occurred" });
    }
};





exports.add_profile_images = async (req, res) => {
    try {

        const userId = req.result.userId;
        const newImagesFromFrontend = req.files?.images;


        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }


        let imagesArray = user.images || [];


        if (newImagesFromFrontend) {
            const uploadedImages = Array.isArray(newImagesFromFrontend) ? newImagesFromFrontend : [newImagesFromFrontend];
            for (const imageFile of uploadedImages) {
                imageFile.userId = user._id
                const uploadedImage = await uploadFile(imageFile);
                imagesArray.push({
                    url: uploadedImage.Location,
                    position: imagesArray.length + 1,
                });
            }
        }


        if (imagesArray.length < 2) {
            return res.status(400).json(errorResponse(messages.validation.minImagesRequired));
        }


        user.images = imagesArray;
        await user.save();

        return res.status(200).json(errorResponse("User images updated successfully", user.images));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.userNotFound, error.message))
    }
}






exports.delete_profile_image = async (req, res) => {
    try {
        const userId = req.result.userId;
        const imageUrl = req.body.imageUrl;


        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, messages.notFound.userNotFound));
        }

        if (user.images.length <= 2) {
            return res.status(400).json(errorResponse(messages.validation.minImagesRequired));
        }


        let imagesArray = user.images || [];
        const imageIndex = imagesArray.findIndex(img => img.url === imageUrl);

        if (imageIndex === -1) {
            return res.status(404).json(errorResponse("Image not found."));
        }


        const [removedImage] = imagesArray.splice(imageIndex, 1);


        const params = {
            Bucket: 'phloii',
            Key: removedImage.url.split('profile_images/')[1],
        };

        await s3.deleteObject(params).promise();


        imagesArray = imagesArray.map((img, index) => ({
            ...img,
            position: index + 1,
        }));


        user.images = imagesArray;
        await user.save();



        return res.status(200).json({
            message: "Image deleted successfully",
            images: user.images
        });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.get_options = async (req, res) => {
    try {
        const step = req.query.step;

        if (!step) {
            return res.status(404).json(errorResponse(messages.generalError.notFound, 'Step is required'));
        }

        const heading = await headingsModel.findOne({ step: step });
        if (!heading) {
            return res.status(404).json(errorResponse(messages.generalError.notFound, 'Heading not found'));
        }


        const questions = await questionsModel.find({ step: step });
        if (questions.length === 0) {
            return res.status(404).json(errorResponse(messages.generalError.notFound, 'Questions not found'));
        }


        const optionsPromises = questions.map(async (question) => {
            const options = await userCharactersticsOptionsModel.find({ question_id: question._id }).select('_id question_id emoji text');
            return {
                questionId: question._id,
                questionText: question.text,
                options: options
            };
        });


        const questionsWithOptions = await Promise.all(optionsPromises);

        return res.status(200).json({
            heading: heading.text,
            questions: questionsWithOptions
        });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.import_contacts = async (req, res) => {
    try {
        let userId = req.result.userId;
        let contact_list = req.body.contact_list;

        if (!contact_list) {
            return res.status(400).json(errorResponse("Please add contacts", "Please add contact list in the body"));
        }

        if (contact_list.length < 1) {
            return res.status(400).json(errorResponse("You have not added any contact"));
        }

     
        const formattedContacts = contact_list.filter(contact => contact.name && contact.number);

        if (formattedContacts.length === 0) {
            return res.status(400).json(errorResponse("Each contact must include both name and number"));
        }

       
        const uniqueContacts = formattedContacts.filter(
            (contact, index, self) => 
                self.findIndex(c => c.number === contact.number) === index
        );

     
        let addContacts = await userModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    contacts: { $each: uniqueContacts }
                }
            },
            { new: true }
        );

        if (!addContacts) {
            return res.status(404).json(errorResponse(messages.generalError.userNotFound, "User not found"));
        }

        return res.status(200).json(successResponse("Contacts added successfully", addContacts.contacts));
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.block_contacts = async (req, res) => {
    try {
        let userId = req.result.userId;
        let blocked_contacts = req.body.blocked_contacts;

        // Validate that blocked_contacts is provided
        if (!blocked_contacts) {
            return res.status(400).json(errorResponse("Please add contacts", "Please add contact list in the body"));
        }

        // Check if the array is empty
        if (blocked_contacts.length < 1) {
            return res.status(400).json(errorResponse("You have not added any contact"));
        }

        // Filter contacts to ensure they have both name and number
        const formattedBlockedContacts = blocked_contacts.filter(contact => contact.name && contact.number);

        // Validate that at least one valid contact is present
        if (formattedBlockedContacts.length === 0) {
            return res.status(400).json(errorResponse("Each blocked contact must include both name and number"));
        }

        // Ensure blocked contacts are unique based on the number
        const uniqueBlockedContacts = formattedBlockedContacts.filter(
            (contact, index, self) => 
                self.findIndex(c => c.number === contact.number) === index
        );

        // Fetch the user's current contacts to validate
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.userNotFound, "User not found"));
        }

        const existingContacts = user.contacts;

        // Check if each blocked contact exists in the contacts list
        const notFoundContacts = uniqueBlockedContacts.filter(blocked =>
            !existingContacts.some(contact => contact.number === blocked.number && contact.name === blocked.name)
        );

        // If any blocked contact is not found in the contacts list, return an error
        if (notFoundContacts.length > 0) {
            return res.status(404).json(errorResponse("These contacts are not found in the contacts list.", notFoundContacts));
        }

        // Block the contacts by adding them to the blocked_contacts array
        let updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    blocked_contacts: { $each: uniqueBlockedContacts }
                }
            },
            { new: true }
        );

        // Respond with the updated blocked contacts
        return res.status(200).json(successResponse("Contacts blocked successfully", updatedUser.blocked_contacts));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.remove_blocked_contacts = async (req, res) => {
    try {
        const userId = req.result.userId;
        let contact_list = req.body.contact_list;

        // Validate that contact_list is provided and is an array
        if (!contact_list || !Array.isArray(contact_list)) {
            return res.status(400).json(errorResponse("Add contacts whom you want to remove from block list", "Contact list should be an array."));
        }

        if (contact_list.length < 1) {
            return res.status(400).json(errorResponse("You have not added any contacts to remove"));
        }

        // Fetch the user's current blocked contacts
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json(errorResponse(messages.generalError.userNotFound, "User not found"));
        }

        const blockedContacts = user.blocked_contacts;

        // Validate that each contact exists in the blocked_contacts
        const notFoundContacts = contact_list.filter(contact =>
            !blockedContacts.some(blocked => blocked.number === contact.number && blocked.name === contact.name)
        );

        if (notFoundContacts.length > 0) {
            return res.status(404).json(errorResponse("These contacts are not found in the blocked list.", notFoundContacts));
        }

        // Prepare the conditions for removal
        const removeConditions = contact_list.map(contact => ({
            name: contact.name,
            number: contact.number
        }));

        // Remove the contacts from the blocked list
        let updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    blocked_contacts: {
                        $or: removeConditions
                    }
                }
            },
            { new: true }
        );

        // Respond with the updated blocked contacts
        return res.status(200).json(successResponse("Contacts removed successfully", updatedUser.blocked_contacts));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.get_contacts = async (req, res) => {
    try {
        let userId = req.result.userId;

      
        let isUserExist = await userModel.findById(userId);
        if (!isUserExist) {
            return res.status(404).json(errorResponse(messages.generalError.userNotFound, "User not found with the given user ID"));
        }

       
        let contact_list = isUserExist.contacts;
        let blocked_contacts = isUserExist.blocked_contacts;

    
        if (!contact_list || contact_list.length < 1) {
            return res.status(400).json(errorResponse("No contacts found for this user."));
        }

       
        if (!blocked_contacts || blocked_contacts.length < 1) {
            blocked_contacts = []; 
        }
        
   
       
        const unblocked_contacts = contact_list.filter(contact =>
            !blocked_contacts.some(blocked => blocked.number === contact.number)
        );

     
        if (unblocked_contacts.length < 1) {
            return res.status(404).json(errorResponse("All contacts are blocked."));
        }

  
        return res.status(200).json(successResponse("Data fetched successfully", unblocked_contacts));
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.get_blocked_contacts = async (req, res) => {
    try {
        let userId = req.result.userId;

     
        let isUserExist = await userModel.findById(userId);
        if (!isUserExist) {
            return res.status(404).json(errorResponse(messages.generalError.userNotFound, "User not found"));
        }

    
        let blocked_contacts = isUserExist.blocked_contacts;

        
        if (!blocked_contacts || blocked_contacts.length < 1) {
            return res.status(400).json(errorResponse("No blocked contacts found for this user"));
        }

        console.log("Blocked contacts ---", blocked_contacts);

     
        return res.status(200).json(successResponse("Data fetched successfully", blocked_contacts));
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.update_phone_number = async (req, res) => {
    try {
        let userId = req.result.userId
        let new_number = req.body.new_number

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found")) }

        if (!new_number) { return res.status(400).json(errorResponse("Please enter your new mobile number", "Enter new mobile number in body")) }

        let isNewNumberExist = await userModel.findOne({ mobile_number: new_number })
        if (isNewNumberExist) { return res.status(400).json(errorResponse("This number is already linked with another account")) }

        let otp = generateOtp()
        let currentTime = new Date()

        await userModel.findByIdAndUpdate(userId, {
            $set: {
                otp: otp,
                otp_sent_at: currentTime
            }
        })

        const smsResponse = await sendTwilioSms(`Your phloii verification code is ${otp}`, new_number);
        if (!smsResponse.success) {
            console.log("error while sending sms")
            // return res.status(400).json({ message: 'Error sending verification code via SMS: ' + smsResponse.error, type: 'error' });
        } else {
            console.log("Response from twilio:::: success--" + smsResponse.success)

        }
        return res.status(200).json(successResponse("verifiction code has been sent to the number " + new_number))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}






exports.verify_updated_number = async (req, res) => {
    try {
        let userId = req.result.userId
        let new_number = req.body.new_number
        let otp = req.body.otp

        let isUserExist = await userModel.findById(userId)

        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user Id")) }

        if (!new_number) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please add the new phone number in the body")) }

        if (!otp) { return res.status(400).json(errorResponse("Please enter OTP sent on the number " + new_number)) }

        const currentTime = new Date();
        const otpSentAt = isUserExist.otp_sent_at;
        const timeDifference = (currentTime - otpSentAt) / (1000 * 60);

        if (timeDifference > 2) { return res.status(400).json(errorResponse("OTP has been expired")) }

        if (otp == isUserExist.otp) {
         await userModel.findByIdAndUpdate(userId,{
            $set:{
                mobile_number:new_number,
                otp:null
            }
         })

         return res.status(200).json(successResponse("OTP verified successfully. New number updated!"))
        } else {
            return res.status(400).json(errorResponse("Entered OTP is incorrect"))
        }

    } catch (error) {
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}