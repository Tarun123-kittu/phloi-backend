
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


        const imageUrls = [];
        for (var file of files) {
            file.establishmentName = establishmentName
            file.establishmentType = establishmentType
            const uploadedImage = await uploadFile(file, "Hotels");
            imageUrls.push(uploadedImage.Location);
        }


        const newAddedHotel = await hotelModel.create({
            hotelAccountId: userId,
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
            onboardingCompleted: true,

        }
        );

        return res.status(200).json(successResponse("Hotel details saved successfully"))

    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.get_hotel_details = async (req, res) => {
    try {
        let id = req.result.userId

        let hotelDetails = await hotelModel.find({ hotelAccountId: id }).select("username establishmentName establishmentType images address ownerDetails uniqueFeatures why_want_phloi adminVerified paymentStatus").lean()

        return res.status(200).json(successResponse("Data retreived", hotelDetails))
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}







exports.update_hotel_details = async (req, res) => {
    try {
        const hotelId = req.body.hotelId;

        if (!hotelId) {
            return res.status(400).json(errorResponse("Something went wrong", "Please provide hotel ID in the query params"));
        }

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

        let images = req.files?.images || [];
        if (!Array.isArray(images)) {
 
            images = [images];
        }

        
        const existingHotel = await hotelModel.findById(hotelId).select("images");
        if (!existingHotel) {
            return res.status(404).json(errorResponse("Hotel not found."));
        }

        let imageUrls = existingHotel.images;
        const currentImageCount = imageUrls.length;

    
        if (images.length > 0) {
            const totalImageCount = currentImageCount + images.length;

            if (totalImageCount > 5) {
                return res.status(400).json(errorResponse(`You can only upload ${5 - currentImageCount} more image(s) to maintain a total of 5 images.`));
            }

            console.log("Uploading new images...");
            const uploadPromises = images.map((file) => uploadFile(file, "Hotels"));
            const uploadedImages = await Promise.all(uploadPromises);
            const uploadedUrls = uploadedImages.map((img) => img.Location);
            imageUrls = imageUrls.concat(uploadedUrls);
        }


        if (imageUrls.length !== 5) {
            return res.status(400).json(errorResponse("You must have exactly 5 images after the update."));
        }

      
        const updatedData = {
            establishmentName: establishmentName || existingHotel.establishmentName,
            establishmentType: establishmentType || existingHotel.establishmentType,
            address: {
                streetAddress: streetAddress || existingHotel.address?.streetAddress,
                suiteUnitNumber: suiteUnitNumber || existingHotel.address?.suiteUnitNumber,
                country: country || existingHotel.address?.country,
                state: state || existingHotel.address?.state,
                pinCode: pinCode || existingHotel.address?.pinCode,
            },
            ownerDetails: {
                ownerName: ownerName || existingHotel.ownerDetails?.ownerName,
                websiteLink: websiteLink || existingHotel.ownerDetails?.websiteLink,
                ownerPhone: ownerPhone || existingHotel.ownerDetails?.ownerPhone,
                ownerEmail: ownerEmail || existingHotel.ownerDetails?.ownerEmail,
            },
            why_want_phloi: why_want_phloi || existingHotel.why_want_phloi,
            uniqueFeatures: uniqueFeatures || existingHotel.uniqueFeatures,
            safeWord: safeWord || existingHotel.safeWord,
            inPersonVisitAvailability: inPersonVisitAvailability ?? existingHotel.inPersonVisitAvailability,
            images: imageUrls,
        };

      
        const updatedHotel = await hotelModel.findByIdAndUpdate(
            hotelId,
            { $set: updatedData, adminVerified: false },
            { new: true }
        );

        return res.status(200).json(successResponse("Hotel details updated successfully", updatedHotel));
    } catch (error) {
        console.error("Error updating hotel details:", error);
        return res.status(500).json(errorResponse("Something went wrong.", error.message));
    }
};





exports.delete_Hotel_image = async (req, res) => {
    try {
        let hotelAccountId = req.query.hotelId;
        let deleteImageIndex = parseInt(req.query.deleteImageIndex);


        let isHotelExist = await hotelModel.findById(hotelAccountId);
        if (!isHotelExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel details with this Id not found"));
        }


        let allImages = isHotelExist.images;
        if (deleteImageIndex < 0 || deleteImageIndex >= allImages.length) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Invalid image index"));
        }

        const imageUrlToDelete = allImages[deleteImageIndex];

        try {
            await deleteFileFromAWS(imageUrlToDelete);
        } catch (awsError) {
            return res.status(500).json(errorResponse("Error deleting file from AWS", awsError.message));
        }

        const updatedHotel = await hotelModel.findByIdAndUpdate(
            hotelAccountId,
            { $pull: { images: allImages[deleteImageIndex] } },
            { new: true }
        );

        if (!updatedHotel) {
            return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, "Failed to update hotel images"));
        }


        return res.status(200).json(successResponse("Hotel image deleted successfully"));

    } catch (error) {
        console.error("Error updating hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}


