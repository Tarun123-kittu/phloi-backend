let userModel = require('../../models/userModel')



const homepageMatchAlgorithm = async (currentUser, page = 1, limit = 10, filter = null) => {
    let { _id, location, gender, intrested_to_see, distance_preference, characteristics, likedUsers, dislikedUsers ,blocked_contacts,sexual_orientation_preference_id,verified_profile} = currentUser;
    const currentCoordinates = location.coordinates;
    const distanceInKm = distance_preference;
    const distanceInMeters = distanceInKm * 1000;
    blocked_contacts = blocked_contacts.map(contact => parseFloat(contact));

   
    try {
       
        let matchQuery = {
            _id: { $nin: [_id, ...likedUsers, ...dislikedUsers] }, 
            mobile_number: {$nin: blocked_contacts.map(contact => contact.number)  },   
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [currentCoordinates, distanceInKm / 6378.1] 
                }
            }
        };

        // if (sexual_orientation_preference_id && sexual_orientation_preference_id.length > 0) {
        //     console.log("inside sexual orientaion -----")
        //     matchQuery['sexual_orientation_preference_id'] = {
        //         $in: sexual_orientation_preference_id
        //     };
        // }

        let distanceInMetersFiltered
        if (filter) {
           
            const { ageMin, maxDistance,ageMax, interestedIn,show_verified_profiles} = filter;
          
            
            matchQuery.dob = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMax)),
                $lte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMin))
            };

          
            if (interestedIn !== 'everyone') {
                matchQuery.gender = { $in: [interestedIn] };
            
                if (gender == 'other') {
                    matchQuery.intrested_to_see = 'everyone';
                } else {
                    matchQuery.intrested_to_see = { $in: [gender] };
                }


                
            }

            // if(show_verified_profiles===true || show_verified_profiles===false){
            //     matchQuery.verified_profile =  show_verified_profiles
            // }

            if(show_verified_profiles===true ){
                matchQuery.verified_profile =  show_verified_profiles
            }

            
            if (maxDistance) {
                distanceInMetersFiltered = maxDistance * 1000;
                matchQuery['location.coordinates'] = {
                    $geoWithin: {
                        $centerSphere: [currentCoordinates, maxDistance / 6378.1] // Radius in radians
                    }
                };
            }
        } else {
           
            if (intrested_to_see !== 'everyone') {
                matchQuery.gender = { $in: [intrested_to_see] };
            
                if (gender == 'other') {
                    matchQuery.intrested_to_see = 'everyone';
                } else {
                    matchQuery.intrested_to_see = { $in: [gender] };
                }
            }
            
          
        }

       console.log("filter ----",filter)

       if (!verified_profile) {
        matchQuery.show_me_to_verified_profiles = { $ne: true };
        }

    
        const usersCount = await userModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: currentCoordinates
                    },
                    distanceField: 'distance',
                    maxDistance: filter ? distanceInMetersFiltered : distanceInMeters,
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
            $lookup: {
                from: 'options', 
                localField: 'relationship_type_preference_id', 
                foreignField: '_id', 
                as: 'relationshipPreference'
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
                    },
                    intrested_to_see:1,
                    study:1,
                    'relationshipPreference.text':1,
                    show_sexual_orientation:1,
                    show_gender:1
                }
            },
            {
                $addFields: {
                    age: { $floor: { $divide: ['$age', 1000 * 60 * 60 * 24 * 365] } }
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $sample: { size: limit } 
            }
        ]).exec(); 


        return { paginatedUsers: users, allUsers: usersCount.length };
    } catch (error) {
        console.error('ERROR::', error);
        throw new Error('Error while finding matching users.');
    }
};



module.exports = homepageMatchAlgorithm;


//*********logic to increase distance if the user not found in user preferrenced distance**********


// const homepageMatchAlgorithm = async (currentUser, page = 1, limit = 10, filter = null) => {
//     const { _id, location, preferences, likedUsers, dislikedUsers, intrested_to_see } = currentUser;
//     const currentCoordinates = location.coordinates;
//     const sexual_orientation_preference_id = new mongoose.Types.ObjectId(preferences.sexual_orientation_preference_id);
    
    
//     let distanceInKm = preferences.distance_preference || 30; 
//     const MAX_ATTEMPTS = 5;

//     try {
//         let matchQuery = {
//             _id: { $nin: [_id, ...likedUsers, ...dislikedUsers] },
//             'preferences.sexual_orientation_preference_id': sexual_orientation_preference_id
//         };

   
//         if (filter) {
//             const { ageMin, ageMax, maxDistance, interestedIn } = filter;

//             matchQuery.dob = {
//                 $gte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMax)),
//                 $lte: new Date(new Date().setFullYear(new Date().getFullYear() - ageMin))
//             };

//             if (interestedIn !== 'everyone') {
//                 matchQuery.gender = { $in: [interestedIn] };
//             }
//         } else if (intrested_to_see !== 'everyone') {
//             matchQuery.gender = { $in: [intrested_to_see] };
//         }

//         let usersCount = [];
//         let attempts = 0;

       
//         while (attempts < MAX_ATTEMPTS) {
//             console.log(`Attempting to find users within ${distanceInKm} km...`);

           
//             matchQuery['location.coordinates'] = {
//                 $geoWithin: {
//                     $centerSphere: [currentCoordinates, distanceInKm / 6378.1] 
//                 }
//             };

            
//             usersCount = await userModel.aggregate([
//                 {
//                     $geoNear: {
//                         near: {
//                             type: 'Point',
//                             coordinates: currentCoordinates
//                         },
//                         distanceField: 'distance',
//                         maxDistance: distanceInKm * 1000, 
//                         query: matchQuery,
//                         spherical: true
//                     }
//                 }
//             ]);

//             console.log(`Found ${usersCount.length} users within ${distanceInKm} km.`);
//             if(filter){
//                 break;
//             }

//             if (usersCount.length > 0) {
//                 break; 
//             }

           
//             distanceInKm += 20;
//             attempts++;
//         }

       
//         if (usersCount.length === 0) {
//             console.log(`No users found after ${MAX_ATTEMPTS} attempts.`);
//             return { paginatedUsers: [], allUsers: 0 };
//         }

    
//         const users = await userModel.aggregate([
//             {
//                 $geoNear: {
//                     near: {
//                         type: 'Point',
//                         coordinates: currentCoordinates
//                     },
//                     distanceField: 'distance',
//                     maxDistance: distanceInKm * 1000,
//                     query: matchQuery,
//                     spherical: true
//                 }
//             },
//             {
//                 $lookup: {
//                     from: 'interests',
//                     localField: 'characteristics.interests_ids',
//                     foreignField: '_id',
//                     as: 'interests'
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     username: 1,
//                     images: 1,
//                     gender: 1,
//                     distance: 1,
//                     distanceInKm: { $divide: ['$distance', 1000] },
//                     interests: { $map: { input: '$interests', as: 'interest', in: '$$interest.interest' } },
//                     age: {
//                         $subtract: [new Date(), '$dob']
//                     }
//                 }
//             },
//             {
//                 $addFields: {
//                     age: { $floor: { $divide: ['$age', 1000 * 60 * 60 * 24 * 365] } }
//                 }
//             },
//             { $skip: (page - 1) * limit },
//             { $limit: limit }
//         ]).exec();

//         console.log("Users per pagination ------", users.length);
//         console.log("All user count --------", usersCount.length);

//         return { paginatedUsers: users, allUsers: usersCount.length };
//     } catch (error) {
//         console.error('ERROR::', error);
//         throw new Error('Error while finding matching users.');
//     }
// };






