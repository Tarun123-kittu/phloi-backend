// seedOptions.js
const mongoose = require('mongoose');
const config = require('./config/config');  
const Option = require('./models/optionsModel'); // Adjust the path if necessary

const options = [
    // sexual orientation
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
    // relationship type preference
    {
        question_id: '66fe594f05a11c463087a34c',
        options: [
            { text: 'Long-term partner', emoji: '❤' },
            { text: 'Long-term open to short', emoji: '😍' },
            { text: 'Short-term open to long', emoji: '🥂' },
            { text: 'Short-term fun', emoji: '🎉' },
            { text: 'New friends', emoji: '👋' },
            { text: 'Still figuring it out', emoji: '🤔' },
            { text: 'Single with kids', emoji: '🙋‍♀️' },
            { text: 'Single no kids', emoji: '👩‍🦰' }
        ]
    },
    // communication
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
    // love receive
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
    // drink
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
    // smoke
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
    // workout  
    {
        question_id: '66fe595005a11c463087a35c',
        options: [
            { text: 'Everyday' },
            { text: 'Often' },
            { text: 'Sometimes' },
            { text: 'Never' }
        ]
    },
    // interest
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
            // Check if the option already exists in the database
            const existingOption = await Option.findOne({
                question_id: question_id,
                text: option.text, // Ensure that you're checking for duplicates by text or _id
            });

            if (!existingOption) {
                // If it doesn't exist, create a new option document
                const optionDocument = new Option({
                    question_id: question_id,
                    text: option.text,
                    emoji: option.emoji || null, // If the emoji is optional
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
