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
        .sort({ createdAt: -1 })
        .lean(); 

        if (availableEvents.length === 0) {
            return res.status(200).json(successResponse("No active events found.", []));
        }

 
        const hotelIds = [...new Set(availableEvents.map(event => event.hotelId.toString()))];

    
        const hotels = await hotelModel.find({ _id: { $in: hotelIds } })
            .select('_id establishmentName address')
            .lean();

        const hotelMap = new Map(hotels.map(hotel => [
            hotel._id.toString(),
            { hotelName: hotel.establishmentName, hotelAddress: hotel.address, events: [] }
        ]));

     
        availableEvents.forEach(event => {
            const hotelData = hotelMap.get(event.hotelId.toString());
            if (hotelData) {
                hotelData.events.push({
                    _id: event._id,
                    eventTitle: event.eventTitle,
                    eventStart: event.eventStart,
                    eventEnd: event.eventEnd,
                    eventDescription: event.eventDescription,
                    image: event.image,
                    createdAt: event.createdAt,
                    updatedAt: event.updatedAt
                });
            }
        });

  
        const groupedEvents = Array.from(hotelMap.values());

        return res.status(200).json(successResponse("Events fetched successfully.", groupedEvents));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};








