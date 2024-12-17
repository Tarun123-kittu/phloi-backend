let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
const userModel = require("../../models/userModel")
let secretDatingModel = require("../../models/secretDatingUserModel")
let exploreRoomsModel = require("../../models/exploreRoomsModel")
let sendPushNotification = require("../../utils/common/pushNotifications")
let optionsModel = require("../../models/optionsModel")
let uploadFile = require("../../utils/common/awsUpload")



exports.monthly_joined_users = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        const startDate = new Date(`${year}-01-01T00:00:00Z`);
        const endDate = new Date(`${year}-12-31T23:59:59Z`);

        const monthNames = [
            null,
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        let monthlyJoinedUsers = await userModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: { $arrayElemAt: [monthNames, "$_id"] },
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        monthlyJoinedUsers.reverse()


        return res
            .status(200)
            .json(successResponse('Data retrieved successfully', monthlyJoinedUsers));

    } catch (error) {
        console.log("ERROR::", error);
        return res
            .status(500)
            .json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.secretDating_monthly_joined_users = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        const startDate = new Date(`${year}-01-01T00:00:00Z`);
        const endDate = new Date(`${year}-12-31T23:59:59Z`);

        const monthNames = [
            null,
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        let monthlyJoinedUsers = await secretDatingModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    month: { $arrayElemAt: [monthNames, "$_id"] },
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        monthlyJoinedUsers.reverse()

        return res
            .status(200)
            .json(successResponse('Data retrieved successfully', monthlyJoinedUsers));

    } catch (error) {
        console.log("ERROR::", error);
        return res
            .status(500)
            .json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.explore_rooms_joinedUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageInt = Math.max(1, parseInt(page));
        const limitInt = Math.max(1, Math.min(100, parseInt(limit)));

        const allRooms_joinedUsers = await exploreRoomsModel
            .find()
            .select('_id room image joined_user_count')
            .skip((pageInt - 1) * limitInt)
            .limit(limitInt)
            .lean();

        if (allRooms_joinedUsers.length < 1) {
            return res
                .status(200)
                .json(successResponse('No rooms found', allRooms_joinedUsers));
        }

        return res
            .status(200)
            .json(successResponse('Data retrieved successfully', allRooms_joinedUsers));
    } catch (error) {
        console.log('ERROR::', error);
        return res
            .status(500)
            .json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.active_inactive_users = async (req, res) => {
    try {
        const result = await userModel.aggregate([
            {
                $group: {
                    _id: null,
                    activeUsers: { $sum: { $cond: [{ $eq: ["$online_status", true] }, 1, 0] } },
                    inactiveUsers: { $sum: { $cond: [{ $eq: ["$online_status", false] }, 1, 0] } }
                }
            }
        ]);

        if (result.length > 0) {
            return res.status(200).json(successResponse("Active/Inactive users", {
                data: [
                    [result[0].activeUsers, result[0].inactiveUsers],
                    ["active", "inactive"]
                ]
            }));
        } else {
            return res.status(200).json(successResponse("No data found", []));
        }

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}



exports.test_pushNotification = async (req, res) => {
    try {
        let imageFile = req.files.image

        const uploadedImage = await uploadFile(imageFile, 'Secret dating avatar');

        if (!uploadedImage || !uploadedImage.Location) {
            return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, "Failed to upload the image to S3"));
        }

        res.send(uploadedImage.Location) ;

        //delete the options selected ********
        //     let mongoose = require("mongoose")
        //     const questionIdsToDelete = [
        //         '66fe594f05a11c463087a34a',
        //         '66fe594f05a11c463087a34c',
        //         '66fe595005a11c463087a34e',
        //         '66fe595005a11c463087a350',
        //         '66fe595005a11c463087a354',
        //         '66fe595005a11c463087a358',
        //         '66fe595005a11c463087a35c',
        //         '66fe595005a11c463087a360'
        //       ].map(id =>new mongoose.Types.ObjectId(id)); 

        //      await optionsModel.deleteMany({ question_id: { $in: questionIdsToDelete } })


        // test push notification *************
        // let message = 'Hii welcome to Phloii....'
        // let result = sendPushNotification("cuF7ulV5IUmMtAlLJ6Lmuh:APA91bET3Y_Q3I5aB6Rk0Rlw5EwufVR5scXrRbATQ2cLLFuwKDKN2olE7K1xFbmZvfgrcLAvEQfh65AVBTSWbKVVqWcR9mOJ6cU8hcdnvw3_kLJ3I3Wm4TY", message)
        // res.send("working.. ")



    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}
