let userModel = require('../../models/userModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')
let questionsModel = require("../../models/questionsModel")
let userCharactersticsOptionsModel = require("../../models/optionsModel")


exports.get_all_users = async (req, res) => {
    try {
        const page = req.query?.page || 1
        const limit = req.query?.limit || 10
        const search = req.query?.search || ""
        const skip = (page - 1) * limit;

        const pipeline = [];

        pipeline.push({
            $match: {
                current_step: 15,
            },
        });


        if (search && search.trim()) {
            const searchFilters = {
                $or: [
                    { username: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { gender: { $regex: search, $options: "i" } },
                    ...(Date.parse(search)
                        ? [{ dob: new Date(search) }]
                        : []),
                    { online_status: { $regex: search, $options: "i" } },
                    { verified_profile: { $regex: search, $options: "i" } },
                ],
            };
            pipeline.push({ $match: searchFilters });
        }


        pipeline.push({
            $project: {
                username: 1,
                images: 1,
                email: 1,
                dob: 1,
                gender: 1,
                online_status: 1,
                verified_profile: 1,
            },
        });

        pipeline.push({
            $sort: { _id: -1 },
        });


        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });


        const countPipeline = [...pipeline];
        countPipeline.pop();
        countPipeline.pop();
        countPipeline.push({ $count: "total" });


        const [users, totalResult] = await Promise.all([
            userModel.aggregate(pipeline),
            userModel.aggregate(countPipeline),
        ]);

        if (users.length < 1) {
            return res.status(400).json(errorResponse('No user found'))
        }

        const totalUsers = totalResult[0]?.total || 0;
        let resultObj = {
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            },
            users,
        }

        return res.status(200).json(successResponse('Data retrieved successfully', resultObj))

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.get_profile_verification_requests = async (req, res) => {
    try {

        const page = req.query?.page || 1
        const limit = req.query?.limit || 10
        const search = req.query?.search || ""
        const skip = (page - 1) * limit

        const pipeline = [];

        pipeline.push({
            $match: {
                current_step: 15,
                initiate_verification_request: true
            },
        });


        if (search && search.trim()) {
            const searchFilters = {
                $or: [
                    { online_status: { $regex: search, $options: "i" } },
                ],
            };
            pipeline.push({ $match: searchFilters });
        }


        pipeline.push({
            $project: {
                username: 1,
                images: 1,
                dob: 1,
                gender: 1,
                online_status: 1,
            },
        });


        pipeline.push({
            $sort: { _id: -1 },
        });


        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: parseInt(limit) });

        const countPipeline = [...pipeline];
        countPipeline.pop();
        countPipeline.pop();
        countPipeline.push({ $count: "total" });


        const [users, totalResult] = await Promise.all([
            userModel.aggregate(pipeline),
            userModel.aggregate(countPipeline),
        ]);

        if (users.length < 1) {
            return res.status(400).json(errorResponse('No user found'))
        }

        const totalUsers = totalResult[0]?.total || 0;
        let resultObj = {
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUsers / limit),
                totalUsers,
            },
            users,
        }

        return res.status(200).json(successResponse('Data retrieved successfully', resultObj))

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}






exports.user_Details = async (req, res) => {
    try {
        const userId = req.query?.userId;
   

        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide a user Id in the query params'));
        }

      
        const user_detail = await userModel
            .findById(userId)
            .select('_id username verified_profile completed_steps show_me_to_verified_profiles mobile_number email dob images gender show_gender intrested_to_see online_status sexual_orientation_preference_id distance_preference user_characterstics subscription_type relationship_type_preference_id')
            .lean();

        if (!user_detail) {
            return res.status(400).json({
                type: "error",
                message: "User not found",
            });
        }

       
        const { user_characterstics } = user_detail;
       

       
        const [
            sexualOrientationOptions,
            relationshipTypeOption,
            allQuestionTexts,
            allAnswerTexts
        ] = await Promise.all([
            userCharactersticsOptionsModel.find({ _id: { $in: user_detail.sexual_orientation_preference_id } })
                .select('_id text')
                .lean(),
            userCharactersticsOptionsModel.findById(user_detail.relationship_type_preference_id)
                .select('_id text')
                .lean(),
            questionsModel.find({})
                .select('_id text')
                .lean(),
            userCharactersticsOptionsModel.find({})
                .select('_id text')
                .lean()
        ]);

      
        const questionTextMap = Object.fromEntries(allQuestionTexts.map(q => [q._id.toString(), q.text]));
        const answerTextMap = Object.fromEntries(allAnswerTexts.map(a => [a._id.toString(), a.text]));

       
        const processedUserCharacteristics = {};
        for (const step in user_characterstics) {
            if (user_characterstics.hasOwnProperty(step)) {
                processedUserCharacteristics[step] = user_characterstics[step].map(characteristic => {
                    const processedCharacteristic = {
                        questionText: questionTextMap[characteristic.questionId?.toString()] || null,
                        answerText: characteristic.answerId
                            ? answerTextMap[characteristic.answerId?.toString()] || null
                            : null,
                        answerTexts: characteristic.answerIds
                            ? characteristic.answerIds.map(id => answerTextMap[id?.toString()] || null).filter(Boolean)
                            : [],
                    };
                    return processedCharacteristic;
                });
            }
        }

    
        const sexualOrientationPreferences = sexualOrientationOptions.map(option => ({
            id: option._id,
            value: option.text,
        }));

        const relationshipTypePreference = relationshipTypeOption
            ? { id: relationshipTypeOption._id, value: relationshipTypeOption.text }
            : null;

        
        const userObj = {
            ...user_detail,
            sexual_orientation_preference_id: sexualOrientationPreferences,
            relationship_type_preference_id: relationshipTypePreference,
            user_characterstics: processedUserCharacteristics,
         
        };

        delete userObj.completed_steps; 

        return res.status(200).json(successResponse('Data retrieved successfully', userObj));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};
