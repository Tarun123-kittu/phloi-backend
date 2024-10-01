

const calculateMatchScore = (currentUser, potentialMatch) => {
    let score = 0;
    let totalComparisons = 0;  

    const preferenceFields = [
        'relationship_type_preference_id',
    ];

    const characteristicFields = [
        'communication_style_id',
        'love_receive_id',
        'drink_frequency_id',
        'smoke_frequency_id',
        'workout_frequency_id',
    ];

  
    preferenceFields.forEach(field => {
        const currentValue = currentUser.preferences[field];
        const potentialValue = potentialMatch.preferences[field];

    
        if (currentValue && potentialValue) {
            totalComparisons++; 
            if (currentValue.toString() === potentialValue.toString()) {
                score += 1; 
            }
        }
    });
  
   
    characteristicFields.forEach(field => {
        const currentValue = currentUser.characteristics[field];
        const potentialValue = potentialMatch.characteristics[field];

        
        if (currentValue && potentialValue) {
            totalComparisons++; 
            if (currentValue.toString() === potentialValue.toString()) {
                score += 1;  
            }
        }
    });
 

 
    const currentUserInterests = currentUser.characteristics.interests_ids || [];
    const potentialMatchInterests = potentialMatch.characteristics.interests_ids || [];

    if (currentUserInterests.length > 0 && potentialMatchInterests.length > 0) {
        
        totalComparisons += currentUserInterests.length;    

       
        const matchingInterests = currentUserInterests.filter(interestId =>
            potentialMatchInterests.includes(interestId.toString())
        );
       
        score += matchingInterests.length;  
       
    }



    const currentUserOrientation = currentUser.preferences.sexual_orientation_preference_id || [];
    const potentialMatchOrientation = potentialMatch.preferences.sexual_orientation_preference_id || [];

    if (currentUserOrientation.length > 0 && potentialMatchOrientation.length > 0) {
        totalComparisons += currentUserOrientation.length;    

        const matchingOrientations = currentUserOrientation.filter(orientationId =>
            potentialMatchOrientation.includes(orientationId.toString())
        );

        score += matchingOrientations.length;  
    }

   
    if (totalComparisons === 0) return 0;

    const matchPercentage = (score / totalComparisons) * 100;

    return matchPercentage;
};



module.exports = calculateMatchScore;
