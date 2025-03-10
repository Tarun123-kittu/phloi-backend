
const hotelModel = require("../../models/hotelModel");
const paymentModel = require("../../models/hotelPaymentsModel")
const { errorResponse, successResponse } = require("../../utils/common/responseHandler")
const messages = require("../../utils/common/messages")
const { uploadFile, deleteFileFromAWS } = require("../../utils/common/awsUpload");
const { default: mongoose } = require("mongoose");
const hotelPaymentsModel = require("../../models/hotelPaymentsModel");
const notificationModel = require("../../models/notificationModel")
const getLatLongFromAddress = require("../../utils/common/catchCoordinates")



exports.saveHotelDetails = async (req, res) => {
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
            city,
            ownerName,
            websiteLink,
            ownerPhone,
            ownerEmail,
            why_want_phloi,
            uniqueFeatures,
            safeWord,
            inPersonVisitAvailability,

            customerServiceNumber,
            food,
            atmosphere,
            services,
            atmosphere_description,
            additional_information,
            openTiming,
            closeTiming
        } = req.body;

        const files = req.files?.images;
        if (!files || files.length < 5) {
            return res.status(400).json(errorResponse("At least five images are required"));
        }

        const imageUrls = [];
        for (const file of files) {
            file.establishmentName = establishmentName;
            const uploadedImage = await uploadFile(file, "Hotels");
            imageUrls.push(uploadedImage.Location);
        }

        const address = {
            streetAddress:streetAddress,
            suiteUnitNumber: suiteUnitNumber,
            country: country,
            state:state,
            pinCode:pinCode,
            city: city
        };

        let coordinates = await getLatLongFromAddress(address)
        
        const newAddedHotel = await hotelModel.create({
            hotelAccountId: userId,
            establishmentName,
            address: address,
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
            
            customerServiceNumber,
            food,
            atmosphere_description,
            additional_information,
            openCloseTimings: {
                open: openTiming,
                close: closeTiming
            },
            onboardingCompleted: true,
            location: {
                type: 'Point',
                coordinates: [coordinates.lng, coordinates.lat]
              }
        });

        return res.status(200).json(successResponse("Hotel details saved successfully"));
    } catch (error) {
        console.error("Error saving hotel details:", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.get_hotel_details = async (req, res) => {
    try {
        let id = req.result.userId;

        let objectId = new mongoose.Types.ObjectId(id);
        const hotelDetails = await hotelModel.aggregate([
            {
                $match: { hotelAccountId: objectId }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'hotel_payments',
                    localField: '_id',
                    foreignField: 'hotelId',
                    as: 'hotelPayments'
                }
            },
            {
                $unwind: {
                    path: '$hotelPayments',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $group: {
                    _id: '$_id',
                    establishmentName: { $first: '$establishmentName' },
                    establishmentType: { $first: '$establishmentType' },
                    images: { $first: '$images' },
                    address: { $first: '$address' },
                    food: { $first: '$food' },
                    atmostphere: { $first: '$atmosphere' },
                    services: { $first: '$services' },
                    openCloseTimings: { $first: '$openCloseTimings' },
                    customerServiceNumber: { $first: '$customerServiceNumber' },
                    ownerDetails: { $first: '$ownerDetails' },
                    uniqueFeatures: { $first: '$uniqueFeatures' },
                    why_want_phloi: { $first: '$why_want_phloi' },
                    adminVerified: { $first: '$adminVerified' },
                    createdAt: { $first: '$createdAt' },
                    hotelPayments: { $first: '$hotelPayments' },
                }
            },
            {
                $addFields: {
                    'hotelPayments.paymentAmount': { $ifNull: ['$hotelPayments.paymentAmount', null] },
                    'hotelPayments.paymentStatus': { $ifNull: ['$hotelPayments.paymentStatus', 'pending'] },
                    'hotelPayments.paymentDate': { $ifNull: ['$hotelPayments.paymentDate', null] },
                    'hotelPayments.subscriptionEndDate': { $ifNull: ['$hotelPayments.subscriptionEndDate', null] },
                    'hotelPayments.receiptUrl': { $ifNull: ['$hotelPayments.receiptUrl', null] }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    establishmentName: 1,
                    establishmentType: 1,
                    images: 1,
                    address: 1,
                    ownerDetails: 1,
                    uniqueFeatures: 1,
                    why_want_phloi: 1,
                    adminVerified: 1,
                    food: 1,
                    atmostphere: 1,
                    services: 1,
                    openCloseTimings: 1,
                    customerServiceNumber: 1,
                    'hotelPayments.paymentAmount': 1,
                    'hotelPayments.paymentStatus': 1,
                    'hotelPayments.paymentDate': 1,
                    'hotelPayments.subscriptionEndDate': 1,
                    'hotelPayments.receiptUrl': 1,
                    createdAt: 1

                }
            }
        ]);

        return res.status(200).json(successResponse("Data retrieved", hotelDetails));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.get_hotel_data = async (req, res) => {
    try {
        const hotelId = req.query.hotelId;

        const [hotel, payment] = await Promise.all([
            hotelModel.findById(hotelId).select('establishmentName establishmentType address ownerDetails why_want_phloi uniqueFeatures inPersonVisitAvailability images adminVerified atmosphere_description additional_information food atmosphere services openCloseTimings customerServiceNumber safeWord'),
            hotelPaymentsModel.findOne({ hotelId }).sort({ createdAt: -1 }).select("paymentStatus paymentAmount paymentDate customerId subscriptionEndDate")
        ]);


        if (!hotel) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel with this hotelId is not registered"));
        }


        const data = {
            hotel,
            paymentDetails: {
                _id: payment?._id ?? null,
                paymentAmount: payment?.paymentAmount ?? null,
                paymentStatus: payment?.paymentStatus ?? null,
                paymentDate: payment?.paymentDate ?? null,
                subscriptionEndDate: payment?.subscriptionEndDate ?? null,
                customerId: payment?.customerId ?? null,
            }
        };

        return res.status(200).json(successResponse("Data retrieved successfully", data));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




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
            city,
            ownerName,
            websiteLink,
            ownerPhone,
            ownerEmail,
            why_want_phloi,
            uniqueFeatures,
            safeWord,
            inPersonVisitAvailability,

            customerServiceNumber,
            food,
            atmosphere,
            services,
            atmosphere_description,
            additional_information,
            openTiming,
            closeTiming
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

            console.log("Uploading new images...");
            const uploadPromises = images.map((file) => uploadFile(file, "Hotels"));
            const uploadedImages = await Promise.all(uploadPromises);
            const uploadedUrls = uploadedImages.map((img) => img.Location);
            imageUrls = imageUrls.concat(uploadedUrls);
        }

        if (imageUrls.length < 5) {
            return res.status(400).json(errorResponse("You have to add atleast 5 images"));
        }

        const updatedData = {
            establishmentName: establishmentName || existingHotel.establishmentName,
            address: {
                streetAddress: streetAddress || existingHotel.address?.streetAddress,
                suiteUnitNumber: suiteUnitNumber || existingHotel.address?.suiteUnitNumber,
                country: country || existingHotel.address?.country,
                state: state || existingHotel.address?.state,
                pinCode: pinCode || existingHotel.address?.pinCode,
                city: city || existingHotel.address?.city,
            },
            ownerDetails: {
                ownerName: ownerName || existingHotel.ownerDetails?.ownerName,
                websiteLink: websiteLink,
                ownerPhone: ownerPhone || existingHotel.ownerDetails?.ownerPhone,
                ownerEmail: ownerEmail || existingHotel.ownerDetails?.ownerEmail,
            },
            why_want_phloi: why_want_phloi || existingHotel.why_want_phloi,
            uniqueFeatures: uniqueFeatures || existingHotel.uniqueFeatures,
            safeWord: safeWord || existingHotel.safeWord,
            inPersonVisitAvailability: inPersonVisitAvailability ?? existingHotel.inPersonVisitAvailability,
            images: imageUrls,
            customerServiceNumber: customerServiceNumber || existingHotel.customerServiceNumber,
            food: food,
            atmosphere_description: atmosphere_description || existingHotel.atmosphere_description,
            additional_information: additional_information,
            openCloseTimings: {
                open: openTiming || existingHotel.openCloseTimings?.open,
                close: closeTiming || existingHotel.openCloseTimings?.close
            }
        };

        const updatedHotel = await hotelModel.findByIdAndUpdate(
            hotelId,
            { $set: updatedData, adminVerified: null },
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




exports.get_hotel_notifications = async (req, res) => {
    try {
        const hotelAccountId = req.result.userId;
        console.log(hotelAccountId)

        let hotelNotifications = await notificationModel.find({ userId: hotelAccountId }).select(" notification_text read createdAt")

        return res.status(200).json(successResponse("Notification retreived successfully", hotelNotifications))

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}


exports.delete_my_establishment = async (req, res) => {
    try {
        let establishmentId = req.query.establishmentId

        let isEstablishmentExist = await hotelModel.findById(establishmentId)
        if (!isEstablishmentExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Establishment not found"))
        }
        await hotelPaymentsModel.deleteMany({ hotelId: establishmentId })
        await hotelModel.findByIdAndDelete(establishmentId)

        return res.status(200).json(successResponse("Establishment deleted successfully"))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}

