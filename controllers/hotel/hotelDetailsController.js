
const hotelModel = require("../../models/hotelModel");
const paymentModel = require("../../models/hotelPaymentsModel")
const { errorResponse, successResponse } = require("../../utils/common/responseHandler")
const messages = require("../../utils/common/messages")
const { uploadFile, deleteFileFromAWS } = require("../../utils/common/awsUpload")



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
                    onboardingCompleted:true,
                },
            },
            { new: true }
        );

        return res.status(200).json(successResponse("Hotel details saved successfully"))

    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.get_hotel_details = async (req, res) => {
    try {
        let hotels = req.result.userId

        let hotelDetails = await hotelModel.findById(hotels).select("username establishmentName establishmentType images address ownerDetails uniqueFeatures why_want_phloi paymentStatus")
        
        return res.status(200).json(successResponse("Data retreived", hotelDetails))
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}






exports.update_hotel_details = async (req, res) => {
    try {
        const userId = req.result.userId;

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
            existingImages = [],
        } = req.body;

        const files = req.files?.images;
        
       
        const existingHotel = await hotelModel.findById(userId);
        if (!existingHotel) {
            return res.status(404).json(errorResponse("Hotel not found."));
        }

        let imageUrls = existingHotel.images;


        const invalidImages = existingImages.filter((url) => !existingHotel.images.includes(url));
        if (invalidImages.length > 0) {
            return res.status(400).json(errorResponse("Invalid existing image URLs provided."));
        }


        if (files && files.length > 0) {
            for (const file of files) {
                const uploadedImage = await uploadFile(file, "Hotels");
                imageUrls.push(uploadedImage.Location);
            }
        }

        console.log("image urls ----", imageUrls)

        // if (imageUrls.length > 5 || imageUrls.length < 5) {
        //     return res.status(400).json(errorResponse("You cannot have more than or less than 5 images."));
        // }


        const updatedData = {
            establishmentName: establishmentName || existingHotel.establishmentName,
            establishmentType: establishmentType || existingHotel.establishmentType,
            address: {
                streetAddress: streetAddress || existingHotel.address.streetAddress,
                suiteUnitNumber: suiteUnitNumber || existingHotel.address.suiteUnitNumber,
                country: country || existingHotel.address.country,
                state: state || existingHotel.address.state,
                pinCode: pinCode || existingHotel.address.pinCode,
            },
            ownerDetails: {
                ownerName: ownerName || existingHotel.ownerDetails.ownerName,
                websiteLink: websiteLink || existingHotel.ownerDetails.websiteLink,
                ownerPhone: ownerPhone || existingHotel.ownerDetails.ownerPhone,
                ownerEmail: ownerEmail || existingHotel.ownerDetails.ownerEmail,
            },
            why_want_phloi: why_want_phloi || existingHotel.why_want_phloi,
            uniqueFeatures: uniqueFeatures || existingHotel.uniqueFeatures,
            safeWord: safeWord || existingHotel.safeWord,
            inPersonVisitAvailability: inPersonVisitAvailability ?? existingHotel.inPersonVisitAvailability,
            images: imageUrls,
        };


        const updatedHotel = await hotelModel.findByIdAndUpdate(
            userId,
            { $set: updatedData, adminVerified: false },
            { new: true }
        );


        const imagesToDelete = existingHotel.images.filter((url) => !imageUrls.includes(url));
        for (const image of imagesToDelete) {
            await deleteFileFromAWS(image);
        }

        return res.status(200).json(successResponse("Hotel details updated successfully", updatedHotel));
    } catch (error) {
        console.error("Error updating hotel details:", error);
        return res.status(500).json(errorResponse("Something went wrong.", error.message));
    }
};
//






