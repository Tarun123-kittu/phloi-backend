const chatModel = require('../../models/chatModel');
const messageModel = require('../../models/messageModel');
const userModel = require("../../models/userModel")
const secretDatingUserModel = require('../../models/secretDatingUserModel')
const hotelInvitationsModel = require('../../models/hotelInvitationsModel')
const { errorResponse, successResponse } = require('../../utils/common/responseHandler');
const messages = require("../../utils/common/messages")
const { io } = require("../../index");
const { uploadFile } = require('../../utils/common/awsUpload')








exports.secretDating_create_chat = async (req, res) => {
    try {
        const { participants } = req.body;


        if (!participants || !Array.isArray(participants)) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Participants must be an array.")) }


        if (participants.length !== 2) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Participants of the chat must be exactly 2.")); }


        const sortedParticipants = participants.sort();

        const existingUsers = await userModel.find({ _id: { $in: sortedParticipants } });
        if (existingUsers.length !== 2) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "One or both participants do not exist."));
        }

        const isSecretDatingJoined = await secretDatingUserModel.find({ user_id: { $in: sortedParticipants }, current_step: 4 })
        if (isSecretDatingJoined.length !== 2) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "One or both participants do not exist in secret dating or not completed registration process."));
        }


        const existingChat = await chatModel.findOne({
            participants: { $all: sortedParticipants },
            type: 'secret dating'
        });

        if (existingChat) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Chat already exists between these secret dating participants.")); }


        const chat = new chatModel({ participants, type: 'secret dating' });
        await chat.save();

        io.emit(`create_secretDating_chat`, chat._id)
        res.status(201).json(successResponse("Chat created successfully", chat));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





// exports.secretDating_getChats = async (req, res) => {
//     try {
//         const userId = req.result.userId;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const searchQuery = req.query.search || "";

//         if (!userId) {
//             return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User ID is required"));
//         }


//         const chats = await chatModel.find({
//             participants: userId,
//             type: 'secret dating'
//         })
//             .populate({
//                 path: 'lastMessage',
//                 populate: {
//                     path: 'sender',
//                     select: 'username'
//                 }
//             })
//             .populate({
//                 path: 'participants',
//                 select: 'username online_status',
//                 match: { _id: { $ne: userId } }
//             })
//             .sort({ updatedAt: -1 }) 
//             .skip(skip)
//             .limit(limit);

//         if (!chats || chats.length === 0) {
//             return res.status(200).json(successResponse("No chats found", []));
//         }

//         let chatDetails = await Promise.all(chats.map(async chat => {
//             const otherParticipant = chat.participants[0];


//             const secretUserData = await secretDatingUserModel.findOne({
//                 user_id: otherParticipant._id
//             }).select('name avatar profile_image');

//             const unreadCount = await messageModel.countDocuments({
//                 chat: chat._id,
//                 receiver: userId,
//                 read_chat: false
//             });

//             const lastMessageText = chat.lastMessage ? chat.lastMessage.text : null;
//             const lastMessageSenderName = chat.lastMessage && chat.lastMessage.sender ? chat.lastMessage.sender.username : null;
//             const messageSentAt = chat.lastMessage ? chat.lastMessage.createdAt : null;

//             return {
//                 chatId: chat._id,
//                 otherParticipantId: otherParticipant ? otherParticipant._id : null,
//                 otherParticipantName: secretUserData ? secretUserData.name : null,
//                 otherParticipantAvatar: secretUserData ? secretUserData.avatar : null,
//                 otherParticipantImage: secretUserData ? secretUserData.profile_image : null,
//                 lastMessage: lastMessageText,
//                 lastMessageSender: lastMessageSenderName,
//                 unreadCount: unreadCount,
//                 messageSentAt: messageSentAt,
//                 onlineStatus: otherParticipant ? otherParticipant.online_status : null
//             };
//         }));

//         const totalChatsCount = await chatModel.countDocuments({
//             participants: userId,
//             type: 'secret dating',
//             'participants.username': { $regex: searchQuery, $options: "i" }
//         });


//         res.status(200).json(successResponse("Secret dating chats retrieved successfully", {
//             chats: chatDetails,
//             currentPage: page,
//             totalChats: totalChatsCount,
//             totalPages: Math.ceil(totalChatsCount / limit)
//         }));

//     } catch (error) {
//         console.error("ERROR::", error);
//         return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
//     }
// };



exports.secretDating_getChats = async (req, res) => {
    try {
        const userId = req.result.userId;

        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User ID is required"));
        }

       
        const chats = await chatModel.find({
            participants: userId,
            type: 'secret dating'
        })
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username'
                }
            })
            .populate({
                path: 'participants',
                select: 'username online_status',
                match: { _id: { $ne: userId } }
            })
            .sort({ updatedAt: -1 });

        if (!chats || chats.length === 0) {
            return res.status(200).json(successResponse("No chats found", []));
        }

       
        let chatDetails = await Promise.all(chats.map(async chat => {
            const otherParticipant = chat.participants[0];

          
            const secretUserData = await secretDatingUserModel.findOne({
                user_id: otherParticipant._id
            }).select('name avatar profile_image');

           
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
                otherParticipantId: otherParticipant ? otherParticipant._id : null,
                otherParticipantName: secretUserData ? secretUserData.name : null,
                otherParticipantAvatar: secretUserData ? secretUserData.avatar : null,
                otherParticipantImage: secretUserData ? secretUserData.profile_image : null,
                lastMessage: lastMessageText,
                lastMessageSender: lastMessageSenderName,
                unreadCount: unreadCount,
                messageSentAt: messageSentAt,
                onlineStatus: otherParticipant ? otherParticipant.online_status : null
            };
        }));

       
        res.status(200).json(successResponse("Secret dating chats retrieved successfully", {
            chats: chatDetails
        }));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.secretDating_sendMessage = async (req, res) => {
    try {
        let { chatId, text } = req.body;
        let senderId = req.result.userId;
        let image = req.files?.image;
        let hotelName = req.body.hotelName;
        let address = req.body.address
        let hotelId = req.body.hotelId
        let hotelImage = req.body.hotelImage
        let meetUp = req.body.meetUp || false

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

        let message
        if (convertToBool) {
            if (!hotelName || !address) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'Please provide all the fields of meetUp')) }
            message = new messageModel({
                chat: chatId, sender: senderId, receiver: receiverId, text: 'meeting',
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



        io.emit(`secretDating_send_message`, {
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







exports.secretDating_getMessages = async (req, res) => {
    try {
        const { chatId, page = 1, limit = 10 } = req.query;

        if (!chatId) {
            return res.status(400).json(errorResponse('Something went wrong. Please try again later.', "Chat ID is required."));
        }


        const skip = (page - 1) * limit;

        let checkLastHotelStatus = await hotelInvitationsModel.findOne({ chatId: chatId }).sort({ createdAt: -1 }).lean();

        const messages = await messageModel.find({ chat: chatId })
            .select('text sender createdAt read hotelData')
            .populate('sender', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));


        if (!messages || messages.length === 0) {
            return res.status(404).json(successResponse("Say hey to start conversation!", "No messages found for this chat."));
        }

        const totalMessages = await messageModel.countDocuments({ chat: chatId });

        let messageObj = {
            messages,
            currentPage: parseInt(page),
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit)
        }


        res.status(200).json({ type: 'success', message: 'Messages retrieved successfully',  hotelInvitationStatus: checkLastHotelStatus?.status?checkLastHotelStatus.status:null, data: messageObj })

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.secretDating_markMessagesAsRead = async (req, res) => {
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
            io.emit('secretDating_messages_read', {
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