let eventsModel = require("../../models/eventsModel")
let hotelModel = require("../../models/hotelModel")
let messages = require("../../utils/common/messages")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")



exports.get_events = async (req, res) => {
    try {
        const now = new Date();

        let availableEvents = await eventsModel.find({
            $or: [
                { "eventEnd.date": { $gt: now } },
                {
                    "eventEnd.date": now.toISOString().split("T")[0],
                    "eventEnd.time": { $gt: now.toTimeString().slice(0, 5) }
                }
            ]
        })
        .select('eventTitle eventStart eventEnd image hotelId')
        .sort({ createdAt: -1 })
        .lean(); 

        if (availableEvents.length === 0) {
            return res.status(200).json(successResponse("No active events found.", []));
        }
     
        const hotelIds = [...new Set(availableEvents.map(event => event.hotelId.toString()))];
        const hotels = await hotelModel.find({ _id: { $in: hotelIds } }).select('_id establishmentName').lean();
        const hotelMap = new Map(hotels.map(hotel => [hotel._id.toString(), hotel.establishmentName]));

        availableEvents = availableEvents.map(event => ({
            ...event,
            hotelName: hotelMap.get(event.hotelId.toString()) || "Unknown Hotel"
        }));

        return res.status(200).json(successResponse("Events fetched successfully.", availableEvents));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.get_eventDetails = async (req, res) => {
    try {
        let eventId = req.query.eventId;

        if (!eventId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Event ID is required."));
        }

        let eventDetails = await eventsModel.findById(eventId)
            .populate('hotelId', 'establishmentName')
            .lean();

        if (!eventDetails) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Event not found with this ID"));
        }


        eventDetails.hotelName = eventDetails.hotelId?.establishmentName || "Unknown Hotel";
        delete eventDetails.hotelId; 

        return res.status(200).json(successResponse("Event fetched successfully.", eventDetails));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};