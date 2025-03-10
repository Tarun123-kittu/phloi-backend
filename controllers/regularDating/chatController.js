const chatModel = require('../../models/chatModel');
const messageModel = require('../../models/messageModel');
const userModel = require("../../models/userModel")
const hotelInvitationsModel = require('../../models/hotelInvitationsModel')
const hotelModel = require("../../models/hotelModel")
const { errorResponse, successResponse } = require('../../utils/common/responseHandler');
const messages = require("../../utils/common/messages")
const { io } = require("../../index");
const { uploadFile } = require('../../utils/common/awsUpload')
const sendPushNotification = require("../../utils/common/pushNotifications");
const generalSettingModel = require('../../models/generalSettingModel');


exports.getChats = async (req, res) => {
    try {
        const userId = req.result.userId;

        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User ID is required"));
        }


        const chats = await chatModel.find({ participants: userId, type: 'regular dating' })
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username'
                }
            })
            .populate({
                path: 'participants',
                select: 'username images online_status',
            })
            .sort({ updatedAt: -1 });

        if (!chats || chats.length === 0) {
            return res.status(200).json(successResponse("No chats found", []));
        }


        let chatDetails = await Promise.all(chats.map(async chat => {
            const otherParticipant = chat.participants.find(participant => participant._id.toString() !== userId);

            const otherParticipantId = otherParticipant ? otherParticipant._id : null;
            const imageObj = otherParticipant?.images?.find(img => img.position === 1);
            const otherParticipantImage = imageObj ? imageObj.url : null;

            const unreadCount = await messageModel.countDocuments({
                chat: chat._id,
                receiver: userId,
                read_chat: false
            });

            const lastMessageText = chat.lastMessage ? chat.lastMessage.text : null;
            const lastMessageSenderName = chat.lastMessage && chat.lastMessage.sender ? chat.lastMessage.sender.username : null;
            const messageSentAt = chat.lastMessage ? chat.lastMessage.createdAt : null;

            return {
                chatId: chat._id,
                otherParticipantId: otherParticipantId,
                otherParticipantName: otherParticipant ? otherParticipant.username : null,
                otherParticipantImage: otherParticipantImage,
                lastMessage: lastMessageText,
                lastMessageSender: lastMessageSenderName,
                unreadCount: unreadCount,
                messageSentAt: messageSentAt,
                onlineStatus: otherParticipant ? otherParticipant.online_status : null
            };
        }));

        res.status(200).json(successResponse("Chats retrieved successfully", {
            chats: chatDetails
        }));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.createChat = async (req, res) => {
    try {
        const { participants } = req.body;


        if (!participants || !Array.isArray(participants)) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Participants must be an array.")) }


        if (participants.length !== 2) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Participants of the chat must be exactly 2.")); }


        const sortedParticipants = participants.sort();

        const existingUsers = await userModel.find({ _id: { $in: sortedParticipants } });
        if (existingUsers.length !== 2) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "One or both participants do not exist."));
        }

        const existingChat = await chatModel.findOne({
            participants: { $all: sortedParticipants },
            type: 'regular dating'
        });

        if (existingChat) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Chat already exists between these participants.")); }


        const chat = new chatModel({ participants, type: 'regular dating' });
        await chat.save();
        io.emit(`create_chat`, chat._id)
        res.status(201).json(successResponse("Chat created successfully", chat));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};




exports.sendMessage = async (req, res) => {
    try {

        let { chatId, text } = req.body;
        let senderId = req.result.userId;
        let mediaType = req.body.mediaType
        let image = req.files?.image;
        let hotelName = req.body.hotelName;
        let address = req.body.address
        let hotelId = req.body.hotelId
        let hotelImage = req.body.hotelImage
        let meetingTime = req.body.meetingTime
        let meetingDate = req.body.meetingDate
        let meetUp = req.body.meetUp || false


        console.log('hotel image   -----', hotelImage)
        var convertToBool = (meetUp == 'true' || meetUp == true);

        if (!chatId) { return res.status(400).json(errorResponse(messages.validation.invalidInput, "Chat ID  are required.")); }


        if (!text && !image) {
            return res.status(400).json(errorResponse(messages.validation.invalidInput, "Either text or image is required."));
        }

        const chat = await chatModel.findById(chatId);
        if (!chat) { return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Chat not found with this chat Id.")); }


        const receiverId = chat.participants.find(participant => !participant.equals(senderId));
        if (!receiverId) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Invalid sender/receiver configuration.")); }

        if (image) {
            image.userId = senderId
            image.chatId = chatId
            let imageData = await uploadFile(image, 'Chat');
            text = imageData.Location
        }

        let message = ''
        if (convertToBool) {
            if (!hotelName || !address || !hotelId || !hotelImage || !meetingTime || !meetingDate) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide all the fields of meetUp')) }

            message = new messageModel({
                chat: chatId,
                sender: senderId,
                receiver: receiverId,
                text: 'Want to meet',
                meetingTime: meetingTime,
                meetingDate: meetingDate,
                hotelData: {
                    hotelName: hotelName,
                    address: address,
                    hotelId: hotelId,
                    hotelImage: hotelImage,
                    status: 'pending'
                }
            });
            await hotelInvitationsModel.create({
                chatId: chatId,
                messageId: message._id
            })

        } else {
            message = new messageModel({ chat: chatId, sender: senderId, receiver: receiverId, text });
        }

        await message.save();


        chat.lastMessage = message._id;
        chat.unreadCount += 1;
        await chat.save();

        let sender = await userModel.findOne({ _id: senderId })
        let receiver = await userModel.findOne({ _id: receiverId })


        let title = sender.username
        let msg
        if (mediaType == 'message') {
            msg = message.text
        } else {
            msg = mediaType
        }

        let senderDetails = await userModel.findById(senderId)


        let data = {
            userId: receiverId.toString(),
            type: 'message',
            senderId: senderId.toString(),
            chatId: chatId.toString(),
            image: senderDetails.images[0].url,
            sender_name: senderDetails.username
        }

        console.log("device token ---->", receiver.deviceToken)
        if (!receiver.deviceToken || receiver.deviceToken == null) {
            console.log("token not found")
        } else {
            let pushNotification = await sendPushNotification(receiver.deviceToken, msg, data, title)
            console.log("push notification-----",pushNotification)
        }
        io.emit(`send_message`, {
            chatId: chatId,
            messageId: message._id,
            text: message.text,
            senderId: message.sender,
            receiverId: receiverId,
            createdAt: message.createdAt,
            unreadCount: chat.unreadCount
        });


        res.status(201).json(successResponse("Message sent successfully", message));


    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};








exports.getMessages = async (req, res) => {
    try {
        const { chatId, page = 1, limit = 10 } = req.query;

        if (!chatId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Chat ID is required."));
        }

        const skip = (page - 1) * limit;
        let checkLastHotelStatus = await hotelInvitationsModel.findOne({ chatId: chatId }).sort({ createdAt: -1 }).lean();


        const message = await messageModel.find({ chat: chatId })
            .select('text sender createdAt read hotelData meetingTime meetingDate')
            .populate('sender', 'username _id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        if (!message || message.length === 0) {
            return res.status(404).json(successResponse("Say hey to start conversation!", "No messages found for this chat."));
        }

        const totalMessages = await messageModel.countDocuments({ chat: chatId });
        let messageObj = {
            message,
            currentPage: parseInt(page),
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit)
        }

        res.status(200).json({ type: 'success', message: 'Messages retrieved successfully', hotelInvitationStatus: checkLastHotelStatus?.status ? checkLastHotelStatus.status : null, data: messageObj })

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.result.userId;


        if (!chatId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Chat ID is required."));
        }

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user Id.")) }


        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Chat not found."));
        }


        const result = await messageModel.updateMany(
            { chat: chatId, receiver: userId, read: false },
            {
                $set: {
                    read: isUserExist.setting.read_receipts,
                    read_chat: true
                }
            }
        );


        if (result.nModified > 0) {
            chat.unreadCount = 0;
            await chat.save();
        }

        if (isUserExist.setting.read_receipts == true) {
            io.emit('messages_read', {
                chatId: chatId,
                userId: userId,
                count: result.nModified
            });

            return res.status(200).json(successResponse("Messages marked as read", { count: result.nModified }));
        } else {
            return res.status(200).json(successResponse("Read receipts is off.Message not marked seen", "Messages not marked as seen due to read receipts is off"));
        }

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}






exports.accept_or_reject_invitation = async (req, res) => {
    try {
        let userId = req.result.userId
        let messageId = req.body.messageId
        let invitationResponse = req.body.invitationResponse


        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'User not found with this User id')) }

        let isMessageExist = await messageModel.findById(messageId)
        if (!isMessageExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Message not found with this message Id')) }


        if (!(invitationResponse == 'accept' || invitationResponse == 'reject')) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Invitation Response must be one of : accept or reject'))
        }

        let chatType = await chatModel.findById(isMessageExist.chat)


        const updatedMessage = await messageModel.findOneAndUpdate(
            { _id: messageId },
            { $set: { 'hotelData.status': invitationResponse } },
            { new: true }
        );

        await hotelInvitationsModel.findOneAndUpdate({ messageId: messageId }, {
            $set: {
                status: invitationResponse
            }
        })
        if (chatType.type == 'regular dating') {
            let receiver = await userModel.findOne({ _id: isMessageExist.sender })
            let receiverId = receiver._id
            let chatId = chatType._id

            let title = isUserExist.username
            let msg = `Invitation ${invitationResponse}`
            let data = {
                userId: receiverId.toString(),
                type: "hotel_invitation",
                sender_name: isUserExist.username,
                image: isUserExist.images[0].url,
                chatId: chatId.toString()
            }
            console.log(" accept reject invitation --------", data)
            if (!receiver.deviceToken || receiver.deviceToken == null) {
                console.log("token not found")
            } else {
                let pushNotification = await sendPushNotification(receiver.deviceToken, msg, data, title)
                console.log("push notification ---", pushNotification)
            }
        }
        io.emit('invitation_updated', {
            chatId: updatedMessage.chat,
            messagId: updatedMessage._id,
            invitationSenderId: updatedMessage.sender
        })
        return res.status(200).json(successResponse('Status Updated', updatedMessage))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}





exports.get_hotelInviations = async (req, res) => {
    try {
        let userId = req.result.userId
        let chatId = req.query?.chatId

        let isUserExist = await userModel.findById(userId)
        if (!isUserExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not exist with this userId"))
        }

        let isChatExist = await chatModel.findById(chatId)
        if (!isChatExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Chat not exist with this chat Id'))
        }

        let checkHotelInvitations = await hotelInvitationsModel.findOne({ chatId: chatId, status: 'pending' })
        if (!checkHotelInvitations) {
            return res.status(200).json(successResponse('No hotel invitations shared yet!', checkHotelInvitations))
        }

        let getHotelDetailsMessage = await messageModel.findOne({ _id: checkHotelInvitations.messageId })

        let hotelDetailsObj = {
            message_id: getHotelDetailsMessage._id,
            sender_id: getHotelDetailsMessage.sender,
            hotelName: getHotelDetailsMessage.hotelData.hotelName,
            hotelAddress: getHotelDetailsMessage.hotelData.address,
            status: getHotelDetailsMessage.hotelData.status
        }
        return res.status(200).json(successResponse('Invitations fetched successfully', hotelDetailsObj))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}





exports.get_all_verified_hotels = async (req, res) => {
    try {
      const userId = req.result.userId;
      
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(400).json(errorResponse(
          messages.generalError.somethingWentWrong, 
          "User not exist with this userId"
        ));
      }
  
      const userCoordinates = user.location && user.location.coordinates;
      if (!userCoordinates || userCoordinates.length !== 2) {
        return res.status(400).json(errorResponse(
          "User location is not set properly."
        ));
      }
      let distanceSetByAdmin = await generalSettingModel.findOne()
      let maxDistance = distanceSetByAdmin.serchHotelsUnder * 1000
  
    
      const hotels = await hotelModel.find({
        adminVerified: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: userCoordinates
            },
            $maxDistance: maxDistance 
          }
        }
      })
      .select("establishmentName establishmentType address images customerServiceNumber openCloseTimings")
      .lean();
  
      return res.status(200).json(successResponse("Data retrieved", hotels));
      
    } catch (error) {
      console.error("ERROR::", error);
      return res.status(500).json(errorResponse(
        messages.generalError.somethingWentWrong, 
        error.message
      ));
    }
  };
  






exports.get_hotel_info = async (req, res) => {
    try {
        let hotelId = req.query.hotelId

        let isHotelExist = await hotelModel.findById(hotelId).select("establishmentName establishmentType address images customerServiceNumber openCloseTimings services atmosphere food atmosphere_description additional_information").lean()
        if (!isHotelExist) { return res.status(400).json(errorResponse("Something went wrong.", "hotel not found with this hotelId")) }

        return res.status(200).json(successResponse("Data retreived", isHotelExist))
    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}

