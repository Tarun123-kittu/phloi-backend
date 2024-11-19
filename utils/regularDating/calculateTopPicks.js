

const calculateMatchScore = (currentUser, potentialMatch) => {
    let score = 0;
    let totalComparisons = 0;

  
    const countTotalComparisons = () => {
        let count = 0;

        
        if (currentUser.user_characterstics.step_11) {
            count += currentUser.user_characterstics.step_11.length;
        }

    
        if (currentUser.user_characterstics.step_12) {
            count += currentUser.user_characterstics.step_12.length;
        }

      
        if (currentUser.user_characterstics.step_13) {
            currentUser.user_characterstics.step_13.forEach(step => {
                count += step.answerIds.length; 
            });
        }

        
        if (currentUser.sexual_orientation_preference_id) {
            count += currentUser.sexual_orientation_preference_id.length;
        }

       
        if (currentUser.love_receive_id) {
            count += 1; 
        }

        return count;
    };

    totalComparisons = countTotalComparisons();

   
    const compareStepAnswers = (currentStep, potentialStep) => {
        currentStep.forEach(currentAnswer => {
            const potentialAnswer = potentialStep.find(potential => 
                potential.questionId.toString() === currentAnswer.questionId.toString()
            );

       
            if (potentialAnswer) {
              
                if (currentAnswer.answerId.toString() === potentialAnswer.answerId.toString()) {
                    score++;
                }
            }
        });
    };

   
    if (currentUser.user_characterstics.step_11 && potentialMatch.user_characterstics.step_11) {
        compareStepAnswers(currentUser.user_characterstics.step_11, potentialMatch.user_characterstics.step_11);
    }


    if (currentUser.user_characterstics.step_12 && potentialMatch.user_characterstics.step_12) {
        compareStepAnswers(currentUser.user_characterstics.step_12, potentialMatch.user_characterstics.step_12);
    }

 
    if (currentUser.user_characterstics.step_13 && potentialMatch.user_characterstics.step_13) {
        currentUser.user_characterstics.step_13.forEach(currentStep => {
            const potentialStep = potentialMatch.user_characterstics.step_13.find(potential => 
                potential.questionId.toString() === currentStep.questionId.toString()
            );

            if (potentialStep) {
               
                const matchingAnswerIds = currentStep.answerIds.filter(answerId => 
                    potentialStep.answerIds.includes(answerId.toString())
                );
                score += matchingAnswerIds.length; 
            }
        });
    }

    
    const currentUserOrientation = currentUser.sexual_orientation_preference_id || [];
    const potentialMatchOrientation = potentialMatch.sexual_orientation_preference_id || [];

    if (currentUserOrientation.length > 0 && potentialMatchOrientation.length > 0) {
        const matchingOrientations = currentUserOrientation.filter(orientationId =>
            potentialMatchOrientation.includes(orientationId.toString())
        );

        score += matchingOrientations.length; 
    }

  
    const currentUserLoveReceive = currentUser.love_receive_id;
    const potentialMatchLoveReceive = potentialMatch.love_receive_id;

    if (currentUserLoveReceive && potentialMatchLoveReceive) {
        if (currentUserLoveReceive.toString() === potentialMatchLoveReceive.toString()) {
            score++;
        }
    }

    
    if (totalComparisons === 0) return 0; 
    const matchPercentage = (score / totalComparisons) * 100;

    return matchPercentage;
};




module.exports = calculateMatchScore;
