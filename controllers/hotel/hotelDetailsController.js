
const hotelModel = require("../../models/hotelModel");
const { errorResponse, successResponse } = require("../../utils/common/responseHandler")
const messages = require("../../utils/common/messages")
const { uploadFile } = require("../../utils/common/awsUpload")



exports.saveHotelDetails = async (req, res) => {
    try {
        const userId = req.result.userId

        const {
            establishmentName,
            establishmentType,
            streetAddress,
            suiteUnitNumber,
            country,
            state,
            pinCode,
            ownerName,
            websiteLink,
            ownerPhone,
            ownerEmail,
            why_want_phloi,
            uniqueFeatures,
            safeWord,
            inPersonVisitAvailability,
        } = req.body;

        const files = req.files?.images
        if (!files || files.length !== 5) {
            return res.status(400).json(errorResponse("You must upload exactly 5 images."));
        }

        const existingHotel = await hotelModel.findById(userId)
        if (!existingHotel) {
            return res.status(400).json(errorResponse("Hotel with this email already exists"))
        }


        const imageUrls = [];
        for (var file of files) {
            file.establishmentName = establishmentName
            file.establishmentType = establishmentType
            const uploadedImage = await uploadFile(file, "Hotels");
            imageUrls.push(uploadedImage.Location);
        }


        const updatedHotel = await hotelModel.findOneAndUpdate(
            { _id: userId },
            {
                $set: {
                    establishmentName,
                    establishmentType,
                    address: {
                        streetAddress,
                        suiteUnitNumber,
                        country,
                        state,
                        pinCode,
                    },
                    ownerDetails: {
                        ownerName,
                        websiteLink,
                        ownerPhone,
                        ownerEmail,
                    },
                    why_want_phloi,
                    uniqueFeatures,
                    safeWord,
                    inPersonVisitAvailability,
                    images: imageUrls,
                },
            },
            { new: true }
        );

        return res.status(200).json(successResponse("Hotel details updated successfully"))

    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.get_hotel_details = async (req, res) => {
    try {
        let hotels = req.result.userId

        let hotelDetails = await hotelModel.findById(hotels).select("username establishmentName establishmentType images address ownerDetails uniqueFeatures why_want_phloi")
        return res.status(200).json(successResponse("Data retreived", hotelDetails))
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}







