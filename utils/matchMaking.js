let userModel = require('../models/userModel')
const mongoose = require('mongoose');


const matchAlgorithm = async (currentUser, page = 1, limit = 10, filter = null) => {
    const { _id, location, gender, intrested_to_see, preferences, characteristics, likedUsers, dislikedUsers } = currentUser;
    const currentCoordinates = location.coordinates;
    const sexual_orientation_preference_id = new mongoose.Types.ObjectId(preferences.sexual_orientation_preference_id);
    const distanceInKm = preferences.distance_preference;
    const distanceInMeters = distanceInKm * 1000;

    try {
       
        let matchQuery = {
            _id: { $nin: [_id, ...likedUsers, ...dislikedUsers] }, 
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [currentCoordinates, distanceInKm / 6378.1] 
                }
            },
            'preferences.sexual_orientation_preference_id': sexual_orientation_preference_id
        };

        if (filter) {
            const { ageMin, ageMax, maxDistance, interestedIn } = filter;

            
            matchQuery.dob = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMax)),
                $lte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMin))
            };

          
            if (interestedIn !== 'everyone') {
                matchQuery.gender = { $in: [interestedIn] };
            }

            
            if (maxDistance) {
                const distanceInMetersFiltered = maxDistance * 1000;
                matchQuery['location.coordinates'] = {
                    $geoWithin: {
                        $centerSphere: [currentCoordinates, maxDistance / 6378.1] // Radius in radians
                    }
                };
            }
        } else {
          
            if (intrested_to_see !== 'everyone') {
                matchQuery.gender = { $in: [intrested_to_see] };
            }
        }

       
        const usersCount = await userModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: currentCoordinates
                    },
                    distanceField: 'distance',
                    maxDistance: filter ? filter.maxDistance * 1000 : distanceInMeters,
                    query: matchQuery,
                    spherical: true
                }
            }
        ]);

    
        const users = await userModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: currentCoordinates
                    },
                    distanceField: 'distance',
                    maxDistance: filter ? filter.maxDistance * 1000 : distanceInMeters,
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
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]).exec();

        console.log("users per pagination ------", users.length);
        console.log("all user count --------", usersCount.length);

        return { paginatedUsers: users, allUsers: usersCount.length };
    } catch (error) {
        console.error('ERROR::', error);
        throw new Error('Error while finding matching users.');
    }
};



module.exports = matchAlgorithm;


