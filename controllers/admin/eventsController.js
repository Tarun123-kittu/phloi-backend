let eventsModel = require("../../models/eventsModel")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")


exports.getEventsList = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query; 
        page = parseInt(page);
        limit = parseInt(limit);
        let skip = (page - 1) * limit;

        let events = await eventsModel.aggregate([
            {
                $lookup: {
                    from: 'hotels',
                    localField: 'hotelId',
                    foreignField: '_id',
                    as: 'hotelDetails'
                }
            },
            {
                $addFields: {
                    establishmentName: { $arrayElemAt: ["$hotelDetails.establishmentName", 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    eventTitle: 1,
                    eventStart: 1,
                    eventEnd: 1,
                    eventDescription: 1,
                    image: 1,
                    establishmentName: 1
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            { 
                $skip: skip 
            },
            { 
                $limit: limit 
            }
        ]);

        let totalEvents = await eventsModel.countDocuments();
        let totalPages = Math.ceil(totalEvents / limit);

        return res.status(200).json(successResponse('Events retrieved successfully', {
            currentPage: page,
            totalPages: totalPages,
            totalEvents: totalEvents,
            events: events
        }));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};
