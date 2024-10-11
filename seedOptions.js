
const mongoose = require('mongoose');
const config = require('./config/config');  
const Option = require('./models/optionsModel');

const options = [
   
    {
        question_id: '66fe594f05a11c463087a34a',
    
        options: [
            { text: 'Straight' },
            { text: 'Gay' },
            { text: 'Lesbian' },
            { text: 'Bisexual' },
            { text: 'Asexual' },
            { text: 'Demisexual' },
            { text: 'Pansexual' },
            { text: 'Queer' },
            { text: 'Bicurious' }
        ]
    },
  
    {
        question_id: '66fe594f05a11c463087a34c',
   
        options: [
            { text: 'Long-term partner', emoji: '❤' ,images:'https://phloii.s3.amazonaws.com/relationshiptTypes/heartWithArrow.png/20241011_153904' },
            { text: 'Long-term, open to short', emoji: '😍',images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/heartEyes.png/20241011_153951' },
            { text: 'Short-term, open to long', emoji: '🥂',images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/cheersGlass.png/20241011_154049' },
            { text: 'Short-term fun', emoji: '🎉',images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/partyPopper.png/20241011_154145' },
            { text: 'New-friends', emoji: '👋',images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/waveingHand.png/20241011_154425' },
            { text: 'Still figuring it out', emoji: '🤔',images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/emojiThinkingFace.png/20241011_154548' },
            { text: 'Single with kids', emoji: '🙋‍♀️' ,images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/singleWithKids.png/20241011_154709' },
            { text: 'Single no kids', emoji: '👩‍🦰' ,images:'https://phloii.s3.eu-north-1.amazonaws.com/relationshiptTypes/singleNoKids.png/20241011_154745' }
        ]
    },
  
    {
        question_id: '66fe595005a11c463087a34e',
     
        options: [
            { text: 'I stay on WhatsApp' },
            { text: 'Big-time texter' },
            { text: 'Phone caller' },
            { text: 'Bad texter' },
            { text: 'Video chatter' },
            { text: 'I am slow to answer on WhatsApp' },
            { text: 'Better in person' }
        ]
    },

    {
        question_id: '66fe595005a11c463087a350',
   
        options: [
            { text: 'Thoughtful gesture' },
            { text: 'Presents' },
            { text: 'Touch' },
            { text: 'Compliments' },
            { text: 'Time together' }
        ]
    },

    {
        question_id: '66fe595005a11c463087a354',

        options: [
            { text: 'Not for me' },
            { text: 'Sober' },
            { text: 'Sober curious' },
            { text: 'On special occasions' },
            { text: 'Socially on weekends' },
            { text: 'Most nights' }
        ]
    },
  
    {
        question_id: '66fe595005a11c463087a358',

        options: [
            { text: 'Social smoker' },
            { text: 'Smoke when drinking' },
            { text: 'Non-smoker' },
            { text: 'Smoker' },
            { text: 'Trying to quit' }
        ]
    },
 
    {
        question_id: '66fe595005a11c463087a35c',
   
        options: [
            { text: 'Everyday' },
            { text: 'Often' },
            { text: 'Sometimes' },
            { text: 'Never' }
        ]
    },

    {
        question_id: '66fe595005a11c463087a360',
       
        options: [
            { text: 'Harry Potter' },
            { text: 'Spa' },
            { text: 'SoundCloud' },
            { text: 'Gymnastics' },
            { text: 'Ludo' },
            { text: 'Maggi' },
            { text: 'Biryani' },
            { text: 'Basketball' },
            { text: 'Heavy Metal' },
            { text: 'House Parties' },
            { text: 'Gin tonic' },
            { text: 'Sushi' },
            { text: 'Hot Yoga' },
            { text: 'Meditation' },
            { text: 'Spotify' },
            { text: 'Hockey' },
            { text: 'Slam Poetry' },
            { text: 'Home Workout' },
            { text: 'Theater' },
            { text: 'Cafe Hopping' },
            { text: 'Sneakers' },
            { text: 'Aquarium' },
            { text: 'Instagram' },
            { text: 'Hot Spring' },
            { text: 'Walking' },
            { text: 'Running' },
            { text: 'Travel' },
            { text: 'Language Exchange' },
            { text: 'Movies' },
            { text: 'Guitarists' },
            { text: 'Social Development' }
        ]
    }
];

async function seedOptions(optionsArray) {
    for (const optionData of optionsArray) {
        const { question_id, options } = optionData;

        for (const option of options) {
       
            const existingOption = await Option.findOne({
                question_id: question_id,
                text: option.text, 
            });

            if (!existingOption) {
              
                const optionDocument = new Option({
                    question_id: question_id,
                    text: option.text,
                    emoji: option.emoji || null, 
                });

                await optionDocument.save()
                    .then(result => {
                        console.log(`Inserted option for question_id ${question_id}: ${result.text}`);
                    })
                    .catch(error => {
                        console.error(`Error inserting option for question_id ${question_id}:`, error);
                    });
            } else {
                console.log(`Option already exists for question_id ${question_id}: ${existingOption.text}`);
            }
        }
    }
}



mongoose
    .connect(config.development.db_url)
    .then(async () => {
        console.log('Connected to MongoDB');
        await seedOptions(options);
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    })
    .finally(() => {
        mongoose.connection.close();
    });
