const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const userModel = require("../models/userModel")
const secretDatingUserModel = require('../models/secretDatingUserModel')
const { errorResponse, successResponse } = require('../utils/responseHandler');
const messages = require("../utils/messages")
const { io } = require("../index");
const { uploadFile } = require('../utils/awsUpload')
let mongoose = require('mongoose')






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






exports.secretDating_getChats = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.result.userId); 
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || "";

        if (!userId) { 
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User ID is required")); 
        }

        const chats = await chatModel.aggregate([

            { 
                $match: { 
                    participants: { $in: [userId] }, 
                    type: 'secret dating'  
                }
            },
        
            // Lookup to get the last message (order by createdAt desc)
            {
                $lookup: {
                    from: 'messages',
                    let: { chatId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
                        { $sort: { createdAt: -1 } },  // Sort by creation time to get the latest message
                        { $limit: 1 }  // Only take the most recent message
                    ],
                    as: 'lastMessage'
                }
            },
        
            // Unwind the last message array
            {
                $unwind: {
                    path: '$lastMessage',
                    preserveNullAndEmptyArrays: true  // Allow chat without messages
                }
            },
        
            // Lookup to count unread messages for each chat
            {
                $lookup: {
                    from: 'messages',
                    let: { chatId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $and: [
                                    { $eq: ['$chat', '$$chatId'] },
                                    { $eq: ['$read_chat', false] },
                                    { $eq: ['$receiver', userId] }  // Ensure the user is the receiver
                                ]}
                            }
                        }
                    ],
                    as: 'unreadMessages'
                }
            },
        
            // Calculate the unread count by counting the size of unreadMessages array
            {
                $addFields: {
                    unreadCount: { $size: '$unreadMessages' }
                }
            },
        
            // Lookup to get the secret dating participants' data
            {
                $lookup: {
                    from: 'secret_dating_users',
                    localField: 'participants',   
                    foreignField: 'user_id',      
                    as: 'secretDatingParticipants'
                }
            },
        
            // Lookup to get the user data
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'userParticipants'
                }
            },
        
            // Unwind the participants' arrays
            { $unwind: { path: '$secretDatingParticipants', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$userParticipants', preserveNullAndEmptyArrays: true } },
        
            // Project necessary fields
            {
                $project: {
                    chatId: '$_id',
                    participants: 1,
                    lastMessage: '$lastMessage.text',
                    otherParticipantName: '$secretDatingParticipants.name',
                    otherParticipantAvatar: '$secretDatingParticipants.avatar',
                    otherParticipantProfileImage: '$secretDatingParticipants.profile_image',
                    bio: '$secretDatingParticipants.bio',
                    interestedToSee: '$secretDatingParticipants.interested_to_see',
                    onlineStatus: '$userParticipants.online_status',
                    unreadCount: 1,  // Now, this will hold the count of unread messages
                    messageSentAt: '$lastMessage.createdAt',
                }
            },
        
            // Group by chatId to aggregate the required fields
            {
                $group: {
                    _id: '$chatId',
                    participants: { $first: '$participants' },
                    lastMessage: { $first: '$lastMessage' },
                    otherParticipantName: { $first: '$otherParticipantName' },
                    otherParticipantAvatar: { $first: '$otherParticipantAvatar' },
                    otherParticipantProfileImage: { $first: '$otherParticipantProfileImage' },
                    bio: { $first: '$bio' },
                    interestedToSee: { $first: '$interestedToSee' },
                    onlineStatus: { $first: '$onlineStatus' },
                    unreadCount: { $first: '$unreadCount' },
                    messageSentAt: { $first: '$messageSentAt' }
                }
            },
        
            // Pagination
            { $skip: skip },
            { $limit: limit },
        
            // Sort by the latest message sent time
            { $sort: { 'messageSentAt': -1 } }
        ]);
        

        // Check if chats are found
        if (!chats || chats.length === 0) {
            return res.status(200).json(successResponse("No chats found", []));
        }

        // Filter chats based on the search query
        const filteredChats = chats.filter(chat => {
            return chat.otherParticipantName.toLowerCase().includes(searchQuery.toLowerCase());
        });

        if (!filteredChats || filteredChats.length === 0) {
            return res.status(200).json(successResponse("No chats found matching the search query", []));
        }

        // Get the total number of chats
        const totalChatsCount = await chatModel.countDocuments({
            participants: userId,  
            type: 'secret dating',
        });

        // Return the response with chat data
        res.status(200).json(successResponse("Chats retrieved successfully", {
            chats: filteredChats,
            currentPage: page,
            totalChats: totalChatsCount,
            totalPages: Math.ceil(totalChatsCount / limit)
        }));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};












