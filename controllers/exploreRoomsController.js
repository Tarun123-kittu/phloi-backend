let userModel = require('../models/userModel')
let roomsModel = require("../models/exploreRoomsModel")
let joinedRoomsModel = require("../models/joinedRoomsModel")
let messages = require("../utils/messages")
let { errorResponse, successResponse } = require("../utils/responseHandler")
let exploreRoomMatchAlgorithm = require("../utils/exploreRoomMatch")
let { io } = require("../index")




exports.get_all_rooms = async (req, res) => {
    try {
        let allRooms = await roomsModel.find().select('_id room image joined_user_count')

        if (allRooms.length < 1) {  return res.status(200).json(successResponse("Not a single room is created yet !"))}

        return res.status(200).json(successResponse("Data retrived successfully", allRooms))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}





exports.join_room = async (req, res) => {
    try {
        let userId = req.result.userId;
        let roomId = req.body.roomId;

        if (!roomId) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please send room id in the request body"));}

        const [isUserExist, isRoomExist] = await Promise.all([
            userModel.findById(userId),
            roomsModel.findById(roomId)
        ]);

        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this userId")); }

        if (!isRoomExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Room not found with this roomId")); }

        if (isUserExist.room_joined === true) { return res.status(400).json(errorResponse("You have already joined a room.")) }

        const joinedUser = {
            userId: userId,
            room_id: roomId
        };

        await joinedRoomsModel.create(joinedUser);

        await roomsModel.findByIdAndUpdate(roomId, {
            $inc: { joined_user_count: 1 }
        });

        await userModel.findByIdAndUpdate(userId, {
            $set: {
                room_joined: true,
                joined_room_id: roomId
            }
        })

        io.emit("user_joined_room")
        return res.status(200).json(successResponse(`You joined the room ${isRoomExist.room}`));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.left_room = async (req, res) => {
    try {
        let userId = req.result.userId;
        let roomId = req.body.roomId;

        if (!roomId) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please send room id in the request body"));}

        let [isUserExist, isRoomExist] = await Promise.all([
            userModel.findById(userId),
            roomsModel.findById(roomId)
        ]);

        if (!isUserExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User not found with this user id")); }
        if (!isRoomExist) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Room not found with this room id")); }


        let userRoom = await joinedRoomsModel.findOne({ userId: userId });
        if (!userRoom) {return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User with this user id has not joined a room"));}


        if (!(userRoom.room_id.equals(isRoomExist._id))) { return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "User is not currently in this room. You're entering the wrong room id")); }
        if (isUserExist.room_joined === false) {  return res.status(400).json(errorResponse("Currently no room is joined by this user")); }

        await joinedRoomsModel.findByIdAndDelete(userRoom._id);

        await roomsModel.findByIdAndUpdate(roomId, {
            $inc: { joined_user_count: -1 },
        });


        await userModel.findByIdAndUpdate(userId, {
            $set: {
                room_joined: false,
                joined_room_id: null
            }
        });

        io.emit("room_left");
        return res.status(200).json(successResponse("Room left!"));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.get_matches_in_explore_rooms = async (req, res) => {
    try {
        const userId = req.result.userId
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
       
        let isUserExist = await userModel.findById(userId).lean()
        if(!isUserExist){ return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong,messages.notFound.userNotFound))}
 
        let matchedUsers = await exploreRoomMatchAlgorithm(isUserExist,page,limit)
       
        return res.status(200).json({
            type: 'success',
            message: 'Users matched successfully',
            currentPage: page,
            users: matchedUsers
        });

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message))
    }
}
 


