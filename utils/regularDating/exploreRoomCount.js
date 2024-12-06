let userModel = require('../../models/userModel')
const mongoose = require('mongoose');


const exploreRoomCount = async (currentUser,roomId) => {
    let { _id, location, gender, intrested_to_see, distance_preference, likedUsers, dislikedUsers, blocked_contacts, verified_profile } = currentUser;
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
            joined_room_id: { $eq: roomId, $ne: null }
        };

    
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
            { $count: 'userCount' } 
         
        ]).exec();

        return users.length > 0 ? users[0].userCount : 0;
    } catch (error) {
        console.error('ERROR::', error);
        throw new Error('Error while finding matching users.');
    }

}

module.exports = exploreRoomCount

