const geolib = require('geolib');
const userModel = require("../models/userModel");

const calculateAge = (dob) => {
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
};

const isAgeInRange = (userAge, minAge, maxAge) => {
    return userAge >= minAge && userAge <= maxAge;
};

const matchAlgorithm = async (currentUser, maxDistance = 100) => {
    const { _id, location, gender, intrested_to_see, preferences, characteristics } = currentUser;
    const currentCoordinates = location.coordinates;
    
    
    let users = await userModel.find({
        _id: { $ne: _id }, // Exclude current user
        gender: intrested_to_see, // Filter by interested gender
        // sexual_orientation_preference_id: preferences.sexual_orientation_preference_id,
    }).lean();
    
    console.log("here 0")
    let scoredUsers =  users.map(user => {
     console.log("here 1")
        let matchScore = 0;
    
        const sharedInterests = characteristics.interests_ids.filter(interest =>
            user.characteristics.interests_ids.includes(interest)
        ).length;
        matchScore += sharedInterests;

      
        if (user.likedUsers.includes(_id) && currentUser.likedUsers.includes(user._id)) {
            matchScore += 10;
        }

  
        const userAge = calculateAge(user.dob);
        if (isAgeInRange(userAge, 18, 30)) {
            matchScore += 1;
        }
       
        return { user, matchScore };
    });

  
    scoredUsers.sort((a, b) => b.matchScore - a.matchScore);
    
   
    scoredUsers = scoredUsers.filter(({ user }) => {
       
        const distance = geolib.getDistance(
            { latitude: currentCoordinates[1], longitude: currentCoordinates[0] },
            { latitude: user.location.coordinates[1], longitude: user.location.coordinates[0] }
        ) / 1000; 
        return distance <= maxDistance;
    });

    
    if (scoredUsers.length === 0) {
        users = await userModel.find({
            _id: { $ne: _id }, 
            'location.coordinates': {
                $geoWithin: {
                    $centerSphere: [
                        [currentCoordinates[0], currentCoordinates[1]],
                        maxDistance / 6378.1,
                    ]
                }
            }
        }).lean();

       
        scoredUsers = users.map(user => {
            const distance = geolib.getDistance(
                { latitude: currentCoordinates[1], longitude: currentCoordinates[0] },
                { latitude: user.location.coordinates[1], longitude: user.location.coordinates[0] }
            ) / 1000;

            return {
                user,
                matchScore: distance < 20 ? 5 : 1
            };
        });

        scoredUsers.sort((a, b) => new Date(b.user.updatedAt) - new Date(a.user.updatedAt));
    }
   
    return scoredUsers.map(match => match.user);
};

module.exports = matchAlgorithm;
