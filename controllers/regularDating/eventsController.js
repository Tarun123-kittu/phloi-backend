let eventsModel = require("../../models/eventsModel")
let messages = require("../../utils/common/messages")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")


exports.get_events = async (req, res) => {
    try {
        const now = new Date();

        let availableEvents = await eventsModel.find({
            $or: [
                { "eventEnd.date": { $gt: now } },
                {
                    "eventEnd.date": { $eq: now.toISOString().split("T")[0] },
                    "eventEnd.time": { $gt: now.toTimeString().slice(0, 5) }
                }
            ]
        }).select('eventTitle eventStart eventEnd image').sort({ createdAt: -1 });

        return res.status(200).json(successResponse("Events fetched successfully.", availableEvents));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};



exports.get_eventDetails = async (req, res) => {
    try {
        let eventId = req.query.eventId

        let eventDetails = await eventsModel.findById(eventId)
        if (!eventDetails) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Event details not found with this Id"))
        }
        return res.status(200).json(successResponse("Event fetched successfully.", eventDetails));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}