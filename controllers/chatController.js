const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const userModel = require("../models/userModel")
const { errorResponse, successResponse } = require('../utils/responseHandler');
const messages = require("../utils/messages")
const { sendTwilioSms } = require('../utils/commonFunctions')
const { io } = require("../index")



// Get all chats for a user
// exports.getChats = async (req, res) => {
//     try {
//         const userId = req.result.userId;
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;

//         if (!userId) {  return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User ID is required"));  }

//         const chats = await chatModel.find({ participants: userId })
//             .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } })
//             .sort({ 'lastMessage.createdAt': -1 })
//             .skip(skip)
//             .limit(limit);


//         if (!chats || chats.length === 0) { return res.status(200).json(successResponse("No chats found", [])); }


//         const chatDetails = await Promise.all(chats.map(async chat => {
//             const unreadCount = await messageModel.countDocuments({ chat: chat._id, receiver: userId, read: false });

//             return {
//                 chatId: chat._id,
//                 lastMessage: chat.lastMessage,
//                 lastMessageSender: chat.lastMessage ? chat.lastMessage.sender.username : null,
//                 unreadCount: unreadCount,
//                 totalUnreadMessages: unreadCount
//             };
//         }));


//         res.status(200).json(successResponse("Chats retrieved successfully", {
//             chats: chatDetails,
//             currentPage: page,
//             totalChats: await chatModel.countDocuments({ participants: userId }),
//             totalPages: Math.ceil(await chatModel.countDocuments({ participants: userId }) / limit)
//         }));

//     } catch (error) {
//         console.error("ERROR::", error);
//         return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
//     }
// };


exports.getChats = async (req, res) => {
    try {
        const userId = req.result.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!userId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User ID is required"));
        }

       
        const chats = await chatModel.find({ participants: userId })
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username' }
            })
            .populate({
                path: 'participants',
                select: 'username images',
            })
            .sort({ 'lastMessage.createdAt': -1 }) 
            .skip(skip)
            .limit(limit);

        if (!chats || chats.length === 0) {
            return res.status(200).json(successResponse("No chats found", []));
        }

        
        const chatDetails = await Promise.all(chats.map(async chat => {
            
            const otherParticipant = chat.participants.find(participant => participant._id.toString() !== userId);

            
            const imageObj = otherParticipant?.images?.find(img => img.position === 1);
            const otherParticipantImage = imageObj ? imageObj.url : null;

           
            const unreadCount = await messageModel.countDocuments({
                chat: chat._id,
                receiver: userId,
                read: false
            });

            return {
                chatId: chat._id,
                otherParticipantName: otherParticipant ? otherParticipant.username : null, 
                otherParticipantImage: otherParticipantImage,
                lastMessage: chat.lastMessage ? chat.lastMessage.text : null, 
                lastMessageSender: chat.lastMessage ? chat.lastMessage.sender.username : null, 
                unreadCount: unreadCount 
            };
        }));

        
        res.status(200).json(successResponse("Chats retrieved successfully", {
            chats: chatDetails,
            currentPage: page,
            totalChats: await chatModel.countDocuments({ participants: userId }),
            totalPages: Math.ceil(await chatModel.countDocuments({ participants: userId }) / limit)
        }));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





// Create a new chat
exports.createChat = async (req, res) => {
    try {
        const { participants } = req.body;


        if (!participants || !Array.isArray(participants)) {  return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Participants must be an array.")) }


        if (participants.length !== 2) {  return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Participants of the chat must be exactly 2.")); }


        const sortedParticipants = participants.sort();


        const existingChat = await chatModel.findOne({
            participants: { $all: sortedParticipants },
        });

        if (existingChat) {  return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Chat already exists between these participants.")); }

        
        const chat = new chatModel({ participants });
        await chat.save();
        io.emit(`create_chat`, chat._id)
        res.status(201).json(successResponse("Chat created successfully", chat));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};



// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const senderId = req.result.userId;


        if (!chatId || !text) { return res.status(400).json(errorResponse(messages.generalError.invalidInput, "Chat ID and message text are required.")); }


        const chat = await chatModel.findById(chatId);
        if (!chat) {  return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Chat not found with this chat Id."));}


        const receiverId = chat.participants.find(participant => !participant.equals(senderId));
        if (!receiverId) {  return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Invalid sender/receiver configuration.")); }

        let receiver = await userModel.findById(receiverId)
        let sender = await userModel.findById(senderId)


        const message = new messageModel({ chat: chatId, sender: senderId, receiver: receiverId, text });
        await message.save();


        chat.lastMessage = message._id;
        chat.unreadCount += 1;
        await chat.save();

        io.emit(`send_message`, {
            chatId: chatId,
            messageId: message._id,
            text: message.text,
            senderId: message.sender,
            receiverId: receiverId,
            createdAt: message.createdAt,
            unreadCount: chat.unreadCount
        });

        const smsResponse = await sendTwilioSms(`New_message from ${sender.username}`, receiver.mobile_number);
        if (!smsResponse.success) {
            // return res.status(400).json({ message: 'Error sending verification code via SMS: ' + smsResponse.error, type: 'error' });
            console.log("error while sending sms")
        }
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


        const messages = await messageModel.find({ chat: chatId })
            .select('text sender createdAt read')
            .populate('sender', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));


        if (!messages || messages.length === 0) {
            return res.status(404).json(successResponse("Say hey to start conversation!", "No messages found for this chat."));
        }


        const totalMessages = await messageModel.countDocuments({ chat: chatId });


        res.status(200).json(successResponse("Messages retrieved successfully", {
            messages,
            currentPage: parseInt(page),
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit)
        }));
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


        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Chat not found."));
        }


        const result = await messageModel.updateMany(
            { chat: chatId, receiver: userId, read: false },
            { $set: { read: true } }
        );


        if (result.nModified > 0) {
            chat.unreadCount = 0;
            await chat.save();
        }

        io.emit('messages_read', {
            chatId: chatId,
            userId: userId,
            count: result.nModified
        });

        res.status(200).json(successResponse("Messages marked as read", { count: result.nModified }));


    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}




