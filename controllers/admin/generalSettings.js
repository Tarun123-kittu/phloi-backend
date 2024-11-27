let generalSettingsModel = require("../../models/generalSettingModel")
let { errorResponse, successResponse } = require("../../utils/common/responseHandler")
let messages = require("../../utils/common/messages")
let exploreRoomsModel = require("../../models/exploreRoomsModel")
let { uploadFile } = require("../../utils/common/awsUpload")



exports.get_maximum_distance = async (req, res) => {
    try {
        let maximumDistance = await generalSettingsModel.findOne()
        if(!maximumDistance){return res.status(400).json(errorResponse('No data found'))}
        return res.status(200).json(successResponse('Data retreived successfully', maximumDistance))
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}


exports.update_maximum_distance_preference = async (req, res) => {
    try {

        const maximum_distance = req.body.maximum_distance;


        if (typeof maximum_distance !== 'number' || maximum_distance <= 0) {
            return res.status(400).json(errorResponse('Invalid maximum distance value. It must be a positive number.'));
        }


        const updatedSetting = await generalSettingsModel.findOneAndUpdate(
            {},
            { maximum_distance },
            { new: true }
        );


        if (!updatedSetting) {
            const newSetting = new generalSettingsModel({ maximum_distance });
            await newSetting.save();
            return res.status(201).json(successResponse('New maximum distance preference created successfully', newSetting));
        }


        return res.status(200).json(successResponse('Maximum distance preference updated successfully'));

    } catch (error) {

        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};





exports.add_explore_room = async (req, res) => {
    try {
        const { room } = req.body;

        if (!room || !req.files || !req.files.image) {
            return res.status(400).json(errorResponse("Room name and image are required"));
        }

        const imageFile = req.files.image;


        const uploadedImage = await uploadFile(imageFile, 'Explore Rooms');

        if (!uploadedImage || !uploadedImage.Location) {
            return res.status(500).json(errorResponse("Failed to upload the image to S3"));
        }


        const newRoom = new exploreRoomsModel({
            room,
            image: uploadedImage.Location,
        });

        await newRoom.save();

        return res.status(201).json(successResponse("Room added successfully", newRoom));
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse("Something went wrong", error.message));
    }
};




exports.update_explore_room = async (req, res) => {
    try {
        const { roomId, room } = req.body;
        const imageFile = req.files?.image;


        if (!roomId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Room ID is required"));
        }


        const existingRoom = await exploreRoomsModel.findById(roomId);

        if (!existingRoom) {
            return res.status(404).json(errorResponse(messages.generalError.somethingWentWrong, "Room not found"));
        }


        const updateData = {
            room: room || existingRoom.room,
            image: existingRoom.image
        };


        if (imageFile) {
            const uploadedImage = await uploadFile(imageFile, 'Explore Rooms');

            if (!uploadedImage || !uploadedImage.Location) {
                return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, "Failed to upload the image to S3"));
            }

            updateData.image = uploadedImage.Location;
        }


        const updatedRoom = await exploreRoomsModel.findByIdAndUpdate(roomId, updateData, { new: true });

        return res.status(200).json(successResponse("Room updated successfully", updatedRoom));
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};






exports.get_expore_room = async (req, res) => {
    try {
        let roomId = req.query.roomId

        if (!roomId) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, "Please provide the room Id "))
        }

        let roomExist = await exploreRoomsModel.findById(roomId).select('_id room image joined_user_count').lean()

        if (!roomExist) {
            return res.status(400).json(errorResponse(messages.generalError.somethingWentWrong, 'This room is not exist'))
        }
        return res.status(200).json(successResponse("Data retieved successfully", roomExist))
    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
}



exports.get_explore_rooms = async (req, res) => {
    try {
        const rooms = await exploreRoomsModel.find().select('_id room image joined_user_count').lean();

        return res.status(200).json(successResponse("Rooms retrieved successfully", rooms));

    } catch (error) {
        console.error('ERROR::', error);
        return res.status(500).json(errorResponse(messages.generalError.somethingWentWrong, error.message));
    }
};


