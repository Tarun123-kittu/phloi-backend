let userModel = require('../models/userModel')
const mongoose = require('mongoose');


const matchAlgorithm = async (currentUser, page = 1, limit = 10) => {

    const { _id, location, gender, intrested_to_see, preferences, characteristics } = currentUser;
    const currentCoordinates = location.coordinates;
    const sexual_orientation_preference_id = new mongoose.Types.ObjectId(preferences.sexual_orientation_preference_id);
    const distanceInKm = preferences.distance_preference; 
    const distanceInMeters = distanceInKm * 1000; 

    try {
        let matchQuery = {
            _id: { $nin: [_id] },
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [currentCoordinates, distanceInKm / 6378.1] // radius in radians
                }
            },
            'preferences.sexual_orientation_preference_id': sexual_orientation_preference_id
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
                $lookup: {
                    from: 'interests', 
                    localField: 'characteristics.interests_ids',
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
                    interests: { $map: { input: '$interests', as: 'interest', in: '$$interest.interest' } }, 
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
};







module.exports= matchAlgorithm