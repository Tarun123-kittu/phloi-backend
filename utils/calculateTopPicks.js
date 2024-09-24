

const calculateMatchScore = (currentUser, potentialMatch) => {
    let score = 0;

   
    const preferenceFields = [
        'relationship_type_preference_id',
        'sexual_orientation_preference_id',
       
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

        
        if (currentValue && potentialValue && currentValue.toString() === potentialValue.toString()) {
            score += 1;
        }
    });

    
    characteristicFields.forEach(field => {
        const currentValue = currentUser.characteristics[field];
        const potentialValue = potentialMatch.characteristics[field];

       
        if (currentValue && potentialValue && currentValue.toString() === potentialValue.toString()) {
            score += 1;
        }
    });

    return score;
};


module.exports = calculateMatchScore
