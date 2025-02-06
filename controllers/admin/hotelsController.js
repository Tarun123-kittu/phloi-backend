let hotelModel = require("../../models/hotelModel")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
let { sendHotelVerificationEmail } = require("../../utils/common/emailSender")
let notificationModel = require("../../models/notificationModel")
const hotelAccountsModel = require("../../models/hotelAccounts")
const hotelPaymentsModel = require("../../models/hotelPaymentsModel")



// exports.get_hotel_verification_requests = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;
//         const skip = (page - 1) * limit;
//         const showVerifiedHotel = req.query.showVerifiedHotel

//         if (showVerifiedHotel !== true && showVerifiedHotel !== false && showVerifiedHotel !== 'true' && showVerifiedHotel !== 'false') {
//             return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,'Please provide a valid boolean in showVerifiedHotel'));
//         }
//         const isShowVerifiedHotel = showVerifiedHotel === true || showVerifiedHotel === 'true';
        

//         const [hotelVerificationRequests, totalRequests] = await Promise.all([
//             hotelModel
//                 .find({ adminVerified: isShowVerifiedHotel })
//                 .select("establishmentName establishmentType address.country adminVerified paymentStatus address.state address.pinCode createdAt")
//                 .sort({ updatedAt: -1 })
//                 .skip(skip)
//                 .limit(limit)
//                 .lean(),
//             hotelModel.countDocuments({ adminVerified: isShowVerifiedHotel }),
//         ]);

//         const responseData = {
//             totalRequests,
//             currentPage: page,
//             totalPages: Math.ceil(totalRequests / limit),
//             requests: hotelVerificationRequests,
//         };

//         return res.status(200).json(successResponse("Data retrieved", responseData));
//     } catch (error) {
//         console.error("ERROR::", error);
//         return res.status(500).json(errorResponse("Something went wrong.", error.message));
//     }
// };

exports.get_hotel_verification_requests = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const showVerifiedHotel = req.query.showVerifiedHotel;

    
        if (showVerifiedHotel !== 'true' && showVerifiedHotel !== 'false' && showVerifiedHotel !== 'null' && showVerifiedHotel !== undefined) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide a valid boolean or null in showVerifiedHotel'));
        }

        let queryCondition = {};
        if (showVerifiedHotel === 'true') {
            queryCondition.adminVerified = true;
        } else if (showVerifiedHotel === 'false') {
            queryCondition.adminVerified = false;
        } else if (showVerifiedHotel === 'null') {
            queryCondition.adminVerified = null;
        }

        const [hotelVerificationRequests, totalRequests] = await Promise.all([
            hotelModel
                .find(queryCondition)
                .select("establishmentName establishmentType address.country adminVerified paymentStatus address.state address.pinCode createdAt")
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            hotelModel.countDocuments(queryCondition),
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




exports.get_hotel_details = async (req, res) => {
    try {
        let hotelId = req.query.hotelId
        
        let isHotelExist = await hotelModel.findById(hotelId).lean()
        if(!isHotelExist){return res.status(400).json(errorResponse("Something went wrong.","hotel not found with this hotelId"))}

        return res.status(200).json(successResponse(isHotelExist))
    } catch (error) {
        console.log('ERROR::',error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}





exports.accept_reject_hotel_verification = async (req, res) => {
    try {
        let adminId = req.result.userId
        let hotelId = req.body.hotelId
        let requestResponse = req.body.requestResponse


        if (!hotelId) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Provide hotel Id in the query params")) }

        let isHotelExist = await hotelModel.findById(hotelId)
        if (!isHotelExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Hotel details with this id do not exist")) }
        
        let hotelAccount = await hotelAccountsModel.findById(isHotelExist.hotelAccountId)

        if (requestResponse !== true && requestResponse !== false) {
            return res.status(400).json(
                errorResponse(
                    messages.generalError.somethingWentWrong,
                    "requestResponse type must be one of: trur or false "
                )
            );
        }

        await hotelModel.findByIdAndUpdate(hotelId, {
            $set: {
                adminVerified: requestResponse
            }
        })

        await notificationModel.create({
            userId:hotelAccount._id,
            sender_id: adminId,
            notification_text: `Your hotel verification request is ${requestResponse==true?"accepted":'rejected'} for ${isHotelExist.establishmentName}`,
            type:'hotel'
        }); 
         console.log("hrere ------")
        const emailResponse = await sendHotelVerificationEmail(isHotelExist.ownerDetails.ownerEmail, requestResponse, isHotelExist.establishmentName, isHotelExist.paymentStatus,hotelId);
        if (emailResponse.success) {
            return res.status(200).json(successResponse('Verification email has been sent successfully'));
        } else {
            console.log("Error::",emailResponse)
            return res.status(500).json(errorResponse('Failed to send email', emailResponse.error));
        }


    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse("Something went wrong.", error.message));
    }
}


exports.delete_establishment = async(req,res)=>{
    try{
    let establishmentId = req.query.establishmentId

    let isEstablishmentExist = await hotelModel.findById(establishmentId)
    if(!isEstablishmentExist){
        return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,"Establishment not found"))
    }
    await hotelPaymentsModel.deleteMany({hotelId:establishmentId})
    await hotelModel.findByIdAndDelete(establishmentId)

    return res.status(200).json(successResponse("Establishment deleted successfully"))

    }catch(error){
        console.log('ERROR::',error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}




