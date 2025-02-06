const hotelModel = require("../../models/hotelModel")
const { errorResponse, successResponse } = require("../../utils/common/responseHandler")
const messages = require('../../utils/common/messages')
const {uploadFile} = require("../../utils/common/awsUpload")
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
        if(image){
            image.userId = hotelId
            let imageData = await uploadFile(image, 'Events');
            uploadedImage = imageData.Location
        }
     

        let eventObject = {
            hotelId:hotelId,
            eventTitle:eventTitle,
            eventStart:{
                date:eventStartDate,
                time:eventStartTime
            },
            eventEnd:{
                date:eventEndDate,
                time:eventEndTime
            },
            eventDescription:eventDescription,
            image:uploadedImage||null
        }

        await eventsModel.create(eventObject)

        return res.status(200).json(successResponse("Event created successfully.",))
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.messages))
    }
} 


