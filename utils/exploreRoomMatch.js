let userModel = require('../models/userModel')
const mongoose = require('mongoose');


const exploreRoomMatchAlgorithm = async (currentUser, page = 1, limit = 10) => {
    const { _id, location, gender, intrested_to_see,distance_preference,sexual_orientation_preference_id ,likedUsers, dislikedUsers,blocked_contacts } = currentUser;
    const currentCoordinates = location.coordinates;
    // const sexual_orientation_preference_id = new mongoose.Types.ObjectId(preferences.sexual_orientation_preference_id);
    const distanceInKm = distance_preference; 
    const distanceInMeters = distanceInKm * 1000; 
    
    try {
       
        const likedUserIds = likedUsers.map(id => new mongoose.Types.ObjectId(id));
        const dislikedUserIds = dislikedUsers.map(id => new mongoose.Types.ObjectId(id));
   
        let matchQuery = {
            _id: { $nin: [_id, ...likedUserIds, ...dislikedUserIds] },
            mobile_number: { $nin: blocked_contacts },
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [currentCoordinates, distanceInKm / 6378.1] 
                }
            },
            'sexual_orientation_preference_id': {
                $in: sexual_orientation_preference_id
            },
            joined_room_id: currentUser.joined_room_id
        };
   
        if (!(intrested_to_see === 'everyone')) {
            matchQuery.gender = { $in: [intrested_to_see] }; 
        }
   
        const users = await userModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: currentCoordinates
                    },
                    distanceField: 'distance',
                    maxDistance: distanceInMeters,
                    query: matchQuery,
                    spherical: true
                }
            },
            {
                $unwind: "$user_characterstics.step_13"
            },
            {
                $lookup: {
                    from: 'options', 
                    localField: 'user_characterstics.step_13.answerIds', 
                    foreignField: '_id', 
                    as: 'interests'
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    images: 1,
                    gender: 1,
                    distance: 1,
                    distanceInKm: { $divide: ['$distance', 1000] },
                    interests: { $map: { input: '$interests', as: 'interest', in: '$$interest.text' } }, 
                    age: {
                        $subtract: [new Date(), '$dob'] 
                    }
                }
            },
            {
                $addFields: {
                    age: { $floor: { $divide: ['$age', 1000 * 60 * 60 * 24 * 365] } } 
                }
            },
            {
                $skip: (page - 1) * limit 
            },
            {
                $limit: limit 
            }
        ]).exec();
   
        console.log("users ------", users.length);
   
        return users;
    } catch (error) {
        console.error('ERROR::', error);
        throw new Error('Error while finding matching users.');
    } 
   
}

module.exports= exploreRoomMatchAlgorithm