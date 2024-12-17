
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
       
         options : [
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
            { text: 'Social Development' },
            { text: 'Coffee' },
            { text: 'Karaoke' },
            { text: 'Free diving' },
            { text: 'Self-development' },
            { text: 'Food tours' },
            { text: 'Water fights' },
            { text: 'Julias' },
            { text: 'Climate change' },
            { text: 'Exhibition' },
            { text: 'Walking my dog' },
            { text: 'LGBTQIA+ rights' },
            { text: 'Feminism' },
            { text: 'Escape rooms' },
            { text: 'Reggaeton' },
            { text: 'Charity shopping' },
            { text: 'Black Lives Matter' },
            { text: 'Road trips' },
            { text: 'Vintage fashion' },
            { text: 'Yoga' },
            { text: 'Solo surfing' },
            { text: 'Happy hour' },
            { text: 'Inclusivity' },
            { text: 'Country music' },
            { text: 'Thriller films' },
            { text: 'K-drama' },
            { text: 'Comic Con' },
            { text: 'Tennis' },
            { text: 'Indie films' },
            { text: 'House parties' },
            { text: 'Sports shows' },
            { text: 'Exhibitions' },
            { text: 'Rap goats' },
            { text: 'Sailing' },
            { text: 'Crosswords' },
            { text: 'Bowling' },
            { text: 'Playstation' },
            { text: 'Pilates' },
            { text: 'Pentathlon' },
            { text: 'Bodybuilding' },
            { text: 'Cheerleading' },
            { text: 'Public speaking' },
            { text: 'Escape football' },
            { text: 'Careers' },
            { text: 'Salt cave' },
            { text: 'Documentaries' },
            { text: 'Drag brunch' },
            { text: 'Lego' },
            { text: 'Mario Kart' },
            { text: 'Horse riding' },
            { text: 'Plant care' },
            { text: 'Nintendo' },
            { text: 'Solo camping' },
            { text: 'Nature walks' },
            { text: 'Skateboarding' },
            { text: 'Techno festivals' },
            { text: 'Drones' },
            { text: 'Hikers' },
            { text: 'ASMR' },
            { text: 'Mental health awareness' },
            { text: 'Hiking' },
            { text: 'Rugby' },
            { text: 'Dating' },
            { text: 'Musical theatre' },
            { text: 'Social media' },
            { text: 'Craft beer' },
            { text: 'Astrology' },
            { text: 'Craft cocktails' },
            { text: 'Sustainability' },
            { text: 'J-Pop' },
            { text: 'Singing' },
            { text: 'Stand-up comedy' },
            { text: 'Punk music' },
            { text: 'R&B' },
            { text: 'Self-care' },
            { text: 'Dogs' },
            { text: 'Photography' },
            { text: 'Pottery' },
            { text: 'Foodie' },
            { text: 'Cats' },
            { text: 'Beach vacations' },
            { text: 'Nightlife' },
            { text: 'Online shopping' },
            { text: 'Sunset' },
            { text: 'Nature' },
            { text: 'Memes' },
            { text: 'Motorcycles' },
            { text: 'Microdosing' },
            { text: 'Mustache' },
            { text: 'Ancap' },
            { text: 'Playing a musical instrument' },
            { text: 'Cosplay' },
            { text: 'Movie creation' },
            { text: 'E-sports' },
            { text: 'Coffee roasting' },
            { text: 'Content creation' },
            { text: 'TV series' },
            { text: 'Binge-watching' },
            { text: 'Pedalboarding' },
            { text: 'Pastel' },
            { text: 'Surfing' },
            { text: 'Vlogging' },
            { text: 'Electronic music' },
            { text: 'Folk music' },
            { text: 'Live music' },
            { text: 'Writing' },
            { text: 'World peace' },
            { text: 'Literature' },
            { text: 'Manga' },
            { text: 'YouTube' },
            { text: 'Martial arts' },
            { text: 'Ice hockey' },
            { text: 'Beach tennis' },
            { text: 'Book clubs' },
            { text: 'Cocktail-based' },
            { text: 'Blowing' },
            { text: 'Priming' },
            { text: 'Psychedelic' },
            { text: 'Lazy days' },
            { text: 'Equality' },
            { text: 'Ramen' },
            { text: 'Music' },
            { text: 'Xbox' },
            { text: 'Marathon' },
            { text: 'Make up' },
            { text: 'Pride' },
            { text: 'Vegan cooking' },
            { text: 'Bouldering' },
            { text: 'Vermouth' },
            { text: 'Volleyball' },
            { text: 'Sports' },
            { text: 'Twitter' },
            { text: 'Virtual reality' },
            { text: 'League of Legends' },
            { text: 'Karate' },
            { text: 'Parties' },
            { text: 'Ballet' },
            { text: 'Music bands' },
            { text: 'Online games' },
            { text: 'Football' },
            { text: 'Opera' },
            { text: 'Fish in a can' },
            { text: 'Capoeira' },
            { text: 'American football' },
            { text: 'Board games' },
            { text: 'Drawing' },
            { text: 'Puke' },
            { text: 'TED talks' },
            { text: 'Roblox' },
            { text: 'Thrive' },
            { text: 'Pro-volunteering' },
            { text: 'Wine' },
            { text: 'Dungeons & Dragons' },
            { text: 'Camping' },
            { text: 'Crossfit' },
            { text: 'Concerts' },
            { text: 'Climbing' },
            { text: 'Baking' },
            { text: 'Stuffing' },
            { text: 'Blogging' },
            { text: 'Post-based' },
            { text: 'Boxing' },
            { text: 'Painting' },
            { text: 'Beachbody' },
            { text: 'Dancing' },
            { text: 'Rosen' },
            { text: 'NBA' },
            { text: 'Active lifestyle' },
            { text: 'Driving' },
            { text: 'Arenas' },
            { text: 'Entrepreneurship' },
            { text: 'Sales' },
            { text: 'BTS' },
            { text: 'Cooking' },
            { text: 'Vegetarianism' },
            { text: 'Salsa' },
            { text: 'Indie music' },
            { text: 'DIY' },
            { text: 'Tower defense' },
            { text: 'Cycling' },
            { text: 'Outlast' },
            { text: 'Soccer' },
            { text: 'Predictions' },
            { text: 'Alternative music' },
            { text: 'Gardening' },
            { text: 'Amateur cook' },
            { text: 'Art' },
            { text: 'Politics' },
            { text: 'Beach sports' },
            { text: 'Techno' },
            { text: 'Fitness classes' },
            { text: 'Jazz' },
            { text: 'Sweet treats' },
            { text: 'DAOs' },
            { text: 'Real estate' },
            { text: 'Podcasts' },
            { text: 'Daddy\'s nights' },
            { text: 'Raves' },
            { text: 'Pranks' },
            { text: 'Comedy' },
            { text: 'Trap music' },
            { text: 'Triathlon' },
            { text: 'Exchange programmes' },
            { text: 'Scours' },
            { text: 'Netflix' },
            { text: 'Disney' },
            { text: 'April' },
            { text: 'Samba' }
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
