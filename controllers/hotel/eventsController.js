const hotelModel = require("../../models/hotelModel")
const { errorResponse, successResponse } = require("../../utils/common/responseHandler")
const messages = require('../../utils/common/messages')
const { uploadFile } = require("../../utils/common/awsUpload")
const eventsModel = require("../../models/eventsModel")


exports.createEvent = async (req, res) => {
    try {
        let { hotelId, eventTitle, eventStartDate, eventStartTime, eventEndDate, eventEndTime, eventDescription } = req.body
        let image = req.files?.image


        let isHotelExist = await hotelModel.findById(hotelId)
        if (!isHotelExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel not found."))
        }

        let uploadedImage
        if (image) {
            image.userId = hotelId
            let imageData = await uploadFile(image, 'Events');
            uploadedImage = imageData.Location
        }


        let eventObject = {
            hotelId: hotelId,
            eventTitle: eventTitle,
            eventStart: {
                date: eventStartDate,
                time: eventStartTime
            },
            eventEnd: {
                date: eventEndDate,
                time: eventEndTime
            },
            eventDescription: eventDescription,
            image: uploadedImage || null
        }

        await eventsModel.create(eventObject)

        return res.status(200).json(successResponse("Event created successfully.",))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}


exports.getAllEvents = async (req, res) => {
    try {
        let hotelId = req.query.hotelId

        let isHotelExist = await hotelModel.findById(hotelId)
        if (!isHotelExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel not found."))
        }

        let events = await eventsModel.find({ hotelId: hotelId }).select('eventTitle').sort({ createdAt: -1 }).lean()
        if (events.length < 1) {
            return res.status(400).json(errorResponse("No events created yet"))
        }

        return res.status(200).json(successResponse('Establishment events fetched successfully', events))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}



exports.getEvent = async (req, res) => {
    try {
        let eventId = req.query.eventId

        let isEventExist = await eventsModel.findById(eventId)
        if (!isEventExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Event not found"))
        }
        return res.status(200).json(successResponse('Event fetched successfully', isEventExist))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
}




exports.updateEvent = async (req, res) => {
    try {
        const { eventId, hotelId, eventTitle, eventStartDate, eventStartTime, eventEndDate, eventEndTime, eventDescription } = req.body;
        const image = req.files?.image;


        const existingEvent = await eventsModel.findById(eventId)
        if (!existingEvent) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Event not found."));
        }


        const isHotelExist = await hotelModel.findById(hotelId);
        if (!isHotelExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel not found."));
        }

        let uploadedImage = existingEvent.image;
        if (image) {
            image.userId = hotelId;
            let imageData = await uploadFile(image, "Events");
            uploadedImage = imageData.Location;
        }


        const updateObject = {
            ...(hotelId && { hotelId }),
            ...(eventTitle && { eventTitle }),
            ...(eventStartDate || eventStartTime ? { eventStart: { date: eventStartDate || existingEvent.eventStart.date, time: eventStartTime || existingEvent.eventStart.time } } : {}),
            ...(eventEndDate || eventEndTime ? { eventEnd: { date: eventEndDate || existingEvent.eventEnd.date, time: eventEndTime || existingEvent.eventEnd.time } } : {}),
            ...(eventDescription && { eventDescription }),
            ...(uploadedImage && { image: uploadedImage }),
        };


        let updatedEvent = await eventsModel.findByIdAndUpdate(eventId, { $set: updateObject }, { new: true });

        return res.status(200).json(successResponse("Event updated successfully.", updatedEvent));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.deleteEvent = async (req, res) => {
    try {
      let eventId = req.query.eventId

      let isEventExist = await eventsModel.findById(eventId)
      if(!isEventExist){
        return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Event not found."));
      }
      await eventsModel.findByIdAndDelete(eventId)
      return res.status(200).json(successResponse("Event deleted successfully."))
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}