let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
const userModel = require("../../models/userModel")
let secretDatingModel = require("../../models/secretDatingUserModel")
let exploreRoomsModel = require("../../models/exploreRoomsModel")
let uploadFile = require("../../utils/common/awsUpload")
const hotelModel = require("../../models/hotelModel")
const eventsModel = require("../../models/eventsModel")



// exports.monthly_joined_users = async (req, res) => {
//     try {
//         const year = req.query.year || new Date().getFullYear();

//         const startDate = new Date(`${year}-01-01T00:00:00Z`);
//         const endDate = new Date(`${year}-12-31T23:59:59Z`);

//         const monthNames = [
//             null,
//             "January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];

//         let monthlyJoinedUsers = await userModel.aggregate([
//             {
//                 $match: {
//                     createdAt: {
//                         $gte: startDate,
//                         $lte: endDate
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: { $month: "$createdAt" },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     month: { $arrayElemAt: [monthNames, "$_id"] },
//                     count: 1,
//                     _id: 0
//                 }
//             },
//             {
//                 $sort: { month: 1 }
//             }
//         ]);

//         monthlyJoinedUsers.reverse()


//         return res
//             .status(200)
//             .json(successResponse('Data retrieved successfully', monthlyJoinedUsers));

//     } catch (error) {
//         console.log("ERROR::", error);
//         return res
//             .status(500)
//             .json(errorResponse(messages.generalError.somethingWentWrong, error.message));
//     }
// };


exports.monthly_joined_users = async (req, res) => {
    try {
        const { year, weekly, startDate: start, endDate: end } = req.query;
        const isWeekly = weekly === 'true';

        const now = new Date();
        const currentYear = year || now.getFullYear();
        let startDate, endDate;

        if (start && end) {
            startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);
        } 
        else if (isWeekly) {
            const dayOfWeek = now.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(now);
            startDate.setDate(now.getDate() - daysToMonday);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        } 
        else {
            startDate = new Date(`${currentYear}-01-01T00:00:00Z`);
            endDate = new Date(`${currentYear}-12-31T23:59:59Z`);
        }

        const monthNames = [
            null, "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        let aggregationPipeline = [
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
                    _id: start && end || isWeekly
                        ? { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } 
                        : { $month: "$createdAt" }, 
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    label: start && end || isWeekly
                        ? "$_id"  
                        : { $arrayElemAt: [monthNames, "$_id"] },
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { label: 1 } 
            }
        ];

        let userStats = await userModel.aggregate(aggregationPipeline);

        if (start && end || isWeekly) {
            let dateMap = new Map(userStats.map(({ label, count }) => [label, count]));

            let filledStats = [];
            let current = new Date(startDate);

            while (current <= endDate) {
                let dateString = current.toISOString().split('T')[0];
                filledStats.push({
                    label: dateString,
                    count: dateMap.get(dateString) || 0
                });

                current.setDate(current.getDate() + 1);
            }

            userStats = filledStats;
        }

        else if (year) {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
        
            let requestedYear = parseInt(year);  
            let currentYear = new Date().getFullYear();
            let currentMonthIndex = new Date().getMonth(); 
            let monthMap = new Map(userStats.map(({ label, count }) => [label, count]));
        
            let monthsToInclude = requestedYear === currentYear 
                ? monthNames.slice(0, currentMonthIndex + 1) 
                : monthNames; 
        
            userStats = monthsToInclude.map(month => ({
                label: month,
                count: monthMap.get(month) || 0
            }));
        }
        return res
            .status(200)
            .json(successResponse('Data retrieved successfully', userStats));

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


exports.get_all_sercretDating_users_count = async (req, res) => {
    try {
        let secretDatingUsers = await secretDatingModel.countDocuments()
        return res.status(200).json(successResponse("Secret dating users count", secretDatingUsers))
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}

exports.get_all_events_count = async (req, res) => {
    try {
        let allEvents = await eventsModel.countDocuments()
        return res.status(200).json(successResponse("Events count", allEvents))
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}

exports.get_all_establishments_count = async (req, res) => {
    try {
    let establishments = await hotelModel.countDocuments()
    return res.status(200).json(successResponse("Establishments count",establishments))
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

        res.send(uploadedImage.Location);

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}
