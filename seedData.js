const mongoose = require('mongoose');
const config = require('./config/config');
const Heading = require('./models/headingsModel');
const Question = require('./models/questionsModel');
const Option = require('./models/optionsModel');

const headings = [
  { step: 7, text: 'Your sexual orientation?', sub_headings: "" },
  { step: 8, text: 'What are you looking for?', sub_headings: "All good if it changes. There’s something for everyone." },
  { step: 11, text: 'What else makes you, you?', sub_headings: "Don’t hold back. Authenticity attracts authenticity." },
  { step: 12, text: 'Let\'s talk lifestyle habits', sub_headings: "Do their habits match yours? You go first." },
  { step: 13, text: 'What are you into?', sub_headings: "You like what you like. Now, let everyone know." }
];

const questions = [
  { identify_text: "sexual_orientation", step: 7, text: 'sexual orientations', icon_image: '' },
  { identify_text: "relationship_type", step: 8, text: 'relationship type', icon_image: '' },
  { identify_text: "communication_style", step: 11, text: 'What is your communication style?', icon_image: 'https://phloii.s3.amazonaws.com/characterstics/communication.png/20241011_160208' },
  { identify_text: "love_receive", step: 11, text: 'How do you receive love?', icon_image: 'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/loveIcon.png/20241011_160242' },
  { identify_text: "drink_frequency", step: 12, text: 'How often do you drink?', icon_image: 'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/drinkIcon.png/20241011_160315' },
  { identify_text: "smoke_frequency", step: 12, text: 'How often do you smoke?', icon_image: 'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/smokeIcon.png/20241011_160343' },
  { identify_text: "workout_frequency", step: 12, text: 'Do you work out?', icon_image: 'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/gymIcon.png/20241011_160422' },
  { identify_text: "interests", step: 13, text: 'What are you into?', icon_image: '' }
];

const optionsData = {
  sexual_orientation: [
    { text: 'Straight' },
    { text: 'Gay' },
    { text: 'Lesbian' },
    { text: 'Bisexual' },
    { text: 'Asexual' },
    { text: 'Demisexual' },
    { text: 'Pansexual' },
    { text: 'Queer' },
    { text: 'Bicurious' }
  ],
  relationship_type: [
    { text: 'Long-term partner', emoji: '❤' },
    { text: 'Long-term, open to short', emoji: '😍' },
    { text: 'Short-term, open to long', emoji: '🥂' },
    { text: 'Short-term fun', emoji: '🎉' },
    { text: 'New-friends', emoji: '👋' },
    { text: 'Still figuring it out', emoji: '🤔' },
    { text: 'Single with kids', emoji: '🙋‍♀️' },
    { text: 'Single no kids', emoji: '👩‍🦰' }
  ],
  communication_style: [
    { text: 'I stay on WhatsApp' },
    { text: 'Big-time texter' },
    { text: 'Phone caller' },
    { text: 'Bad texter' },
    { text: 'Video chatter' },
    { text: 'I am slow to answer on WhatsApp' },
    { text: 'Better in person' }
  ],
  love_receive: [
    { text: 'Thoughtful gesture' },
    { text: 'Presents' },
    { text: 'Touch' },
    { text: 'Compliments' },
    { text: 'Time together' }
  ],
  drink_frequency: [
    { text: 'Not for me' },
    { text: 'Sober' },
    { text: 'Sober curious' },
    { text: 'On special occasions' },
    { text: 'Socially on weekends' },
    { text: 'Most nights' }
  ],
  smoke_frequency: [
    { text: 'Social smoker' },
    { text: 'Smoke when drinking' },
    { text: 'Non-smoker' },
    { text: 'Smoker' },
    { text: 'Trying to quit' }
  ],
  workout_frequency: [
    { text: 'Everyday' },
    { text: 'Often' },
    { text: 'Sometimes' },
    { text: 'Never' }
  ],
  interests: [
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
};

async function syncCollection(dataArray, Model, modelName) {
  await Model.deleteMany({});
  console.log(`Removed all documents from ${modelName}.`);

  const insertedDocs = await Model.insertMany(dataArray);
  console.log(`Inserted ${insertedDocs.length} documents into ${modelName}.`);
  return insertedDocs;
}

async function seedAllData() {
  try {

    await syncCollection(headings, Heading, 'Heading');
    const insertedQuestions = await syncCollection(questions, Question, 'Question');

   
    const questionIdMap = {};
    insertedQuestions.forEach(question => {
      questionIdMap[question.identify_text] = question._id;
    });

  
    for (const [identifyText, options] of Object.entries(optionsData)) {
      const question_id = questionIdMap[identifyText];

      for (const option of options) {
        const optionDocument = new Option({
          question_id: question_id,
          text: option.text,
          emoji: option.emoji || null
        });
        await optionDocument.save();
        console.log(`Inserted option for question: ${identifyText} -> ${option.text}`);
      }
    }

    console.log('All data synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing data:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose
  .connect(config.development.db_url)
  .then(() => {
    console.log('Connected to MongoDB');
    return seedAllData();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
