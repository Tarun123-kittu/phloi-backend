let userModel = require('../models/userModel');
let secretDatingUserModel = require('../models/secretDatingUserModel');

const secretDatingMatchAlgorithm = async (currentUser, secretDatingCurrentUser, page = 1, limit = 10, filter = null) => {
    let { _id, location, distance_preference, likedUsers, dislikedUsers, blocked_contacts, verified_profile } = currentUser;
    const currentCoordinates = location.coordinates;
    const distanceInKm = distance_preference;
    const distanceInMeters = distanceInKm * 1000;
    blocked_contacts = blocked_contacts.map(contact => parseFloat(contact));

    let { sexual_orientation_preference_id, interested_to_see } = secretDatingCurrentUser;


    try {
        let matchQuery = {
            _id: { $nin: [_id, ...likedUsers, ...dislikedUsers] },
            mobile_number: { $nin: blocked_contacts.map(contact => contact.number) },
            secret_dating_mode:true,
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [currentCoordinates, distanceInKm / 6378.1]
                }
            }
        };

        if (filter) {
            const { ageMin, maxDistance, ageMax, interestedIn, show_verified_profiles } = filter;
            matchQuery.dob = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMax)),
                $lte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMin))
            };

            if (interestedIn !== 'everyone') {
                matchQuery.gender = { $in: [interestedIn] };
            }

            if (show_verified_profiles === true || show_verified_profiles === false) {
                matchQuery.verified_profile = show_verified_profiles;
            }

            if (maxDistance) {
                matchQuery['location.coordinates'] = {
                    $geoWithin: {
                        $centerSphere: [currentCoordinates, maxDistance / 6378.1]
                    }
                };
            }
        } else {
            if (interested_to_see !== 'everyone') {
                matchQuery.gender = { $in: [interested_to_see] };
            }
        }
       
        if (!verified_profile) {
            matchQuery.show_me_to_verified_profiles = { $ne: true };
        }

        const users = await userModel.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: currentCoordinates },
                    distanceField: 'distance',
                    maxDistance: filter ? filter.maxDistance * 1000 : distanceInMeters,
                    query: matchQuery,
                    spherical: true
                }
            },
            {
                $lookup: {
                    from: 'secret_dating_users',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'secretDatingProfile'
                }
            },
            {
                $unwind: {
                    path: "$secretDatingProfile",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    'secretDatingProfile.sexual_orientation_preference_id': { $in: sexual_orientation_preference_id || [] }
                }
            },
            {
                $project: {
                    _id: 1,
                    // username: 1,
                    // images: 1,
                    gender: 1,
                    distance: 1,
                    distanceInKm: { $divide: ['$distance', 1000] },
                    age: { $floor: { $divide: [{ $subtract: [new Date(), '$dob'] }, 1000 * 60 * 60 * 24 * 365] } },
                    'secretDatingProfile.name': 1,
                    'secretDatingProfile.avatar': 1,
                    'secretDatingProfile.sexual_orientation_preference_id': 1,
                    'secretDatingProfile.relationship_preference': 1
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ]);
        
        const usersCount = await userModel.countDocuments(matchQuery);

        return { paginatedUsers: users, allUsers: usersCount };
    } catch (error) {
        console.error('ERROR::', error);
        throw new Error('Error while finding matching users.');
    }
};

module.exports = secretDatingMatchAlgorithm;
