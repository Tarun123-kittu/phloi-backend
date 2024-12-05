let hotelModel = require("../../models/hotelModel")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
let {sendHotelVerificationEmail} = require("../../utils/common/emailSender")


exports.get_hotel_verification_requests = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;


        const [hotelVerificationRequests, totalRequests] = await Promise.all([
            hotelModel
                .find({ adminVerified: false })
                .select("establishmentName establishmentType address.country paymentStatus createdAt")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            hotelModel.countDocuments({ adminVerified: false }),
        ]);

        const responseData = {
            totalRequests,
            currentPage: page,
            totalPages: Math.ceil(totalRequests / limit),
            requests: hotelVerificationRequests,
        };

        return res.status(200).json(successResponse("Data retrieved", responseData));
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse("Something went wrong.", error.message));
    }
};




exports.accept_reject_hotel_verification = async (req, res) => {
    try {
        let hotelId = req.body.hotelId
        let requestResponse = req.body.requestResponse
        

        if (!hotelId) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Provide hotel Id in the query params")) }

        let isHotelExist = await hotelModel.findById(hotelId)
        if (!isHotelExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel details with this id do not exist")) }

        if (requestResponse !==  true && requestResponse !== false) {
            return res.status(400).json(
                errorResponse(
                    messages.generalError.somethingWentWrong,
                    "requestResponse type must be one of: trur or false "
                )
            );
        }

        await hotelModel.findByIdAndUpdate(hotelId, {
            $set: { 
                adminVerified:requestResponse
            }
        })

        const emailResponse = await sendHotelVerificationEmail(isHotelExist.ownerDetails.ownerEmail, requestResponse,isHotelExist.establishmentName,isHotelExist.paymentStatus);
        if (emailResponse.success) {
          return res.status(200).json(successResponse('Verification email has been sent successfully'));
        } else {
          return res.status(500).json(errorResponse('Failed to send email', emailResponse.error));
        }
        
       
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse("Something went wrong.", error.message));
    }
}



