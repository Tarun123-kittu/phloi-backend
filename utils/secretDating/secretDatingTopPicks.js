


const topPicksMatchScore = (currentUser, potentialMatch) => {

    let score = 0;
    let totalComparisons = 0;

    const countTotalComparisons = () => {
        let count = 0;

  
        if (currentUser.sexual_orientation_preference_id) {
            count += currentUser.sexual_orientation_preference_id.length;
        }

  
        if (currentUser.relationship_preference) {
            count += 1;
        }

        return count;
    };

    totalComparisons = countTotalComparisons();

  
    const currentUserOrientation = currentUser.sexual_orientation_preference_id || [];
    const potentialMatchOrientation = potentialMatch.secretDatingInfo.sexual_orientation_preference_id || [];

    if (currentUserOrientation.length > 0 && potentialMatchOrientation.length > 0) {
        const matchingOrientations = currentUserOrientation.filter(orientationId =>
            potentialMatchOrientation.includes(orientationId.toString())
        );
        score += matchingOrientations.length; 
    }


    const currentUserRelationshipPref = currentUser.relationship_preference;
    const potentialMatchRelationshipPref = potentialMatch.secretDatingInfo.relationship_preference;

    if (currentUserRelationshipPref && potentialMatchRelationshipPref) {
        if (currentUserRelationshipPref.toString() === potentialMatchRelationshipPref.toString()) {
            score++;
        }
    }


    if (totalComparisons === 0) return 0;

  
    const matchPercentage = (score / totalComparisons) * 100;

    return matchPercentage;
};

module.exports = topPicksMatchScore