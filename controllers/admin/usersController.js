let userModel = require('../../models/userModel')
let { errorResponse, successResponse } = require('../../utils/common/responseHandler')
let messages = require('../../utils/common/messages')


exports.get_all_users = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
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
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;
 
        let verificationRequests = await userModel.find({current_step:15,initiate_verification_request:true}).select('images username dob gender online_status')
        if(verificationRequests.length<1){
            return res.status(400).json(errorResponse("No verification requests till now"))
        }
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}



