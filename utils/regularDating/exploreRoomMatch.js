let userModel = require('../../models/userModel')
const mongoose = require('mongoose');


const exploreRoomMatchAlgorithm = async (currentUser, page = 1, limit = 10) => {
    let { _id, location, gender, intrested_to_see, distance_preference, sexual_orientation_preference_id, likedUsers, dislikedUsers, blocked_contacts, verified_profile } = currentUser;
    const currentCoordinates = location.coordinates;
    const distanceInKm = distance_preference;
    const distanceInMeters = distanceInKm * 1000;
    blocked_contacts = blocked_contacts.map(contact => parseFloat(contact));

    try {
        const likedUserIds = likedUsers.map(id => new mongoose.Types.ObjectId(id));
        const dislikedUserIds = dislikedUsers.map(id => new mongoose.Types.ObjectId(id));

        let matchQuery = {
            _id: { $nin: [_id, ...likedUserIds, ...dislikedUserIds] },
            mobile_number: { $nin: blocked_contacts.map(contact => contact.number) },
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [currentCoordinates, distanceInKm / 6378.1]
                }
            },
            joined_room_id: { $eq: currentUser.joined_room_id, $ne: null }
        };

        // if (sexual_orientation_preference_id && sexual_orientation_preference_id.length > 0) {
        //     matchQuery['sexual_orientation_preference_id'] = {
        //         $in: sexual_orientation_preference_id
        //     };
        // }

        if (intrested_to_see !== 'everyone') {
            matchQuery.gender = { $in: [intrested_to_see] };

            if (gender == 'other') {
                matchQuery.intrested_to_see = 'everyone';
            } else {
                matchQuery.intrested_to_see = { $in: [gender] };
            }
        }

        if (!verified_profile) {
            matchQuery.show_me_to_verified_profiles = { $ne: true };

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
                $unwind: {
                    path: "$user_characterstics.step_13",
                    preserveNullAndEmptyArrays: true
                }
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

module.exports = exploreRoomMatchAlgorithm