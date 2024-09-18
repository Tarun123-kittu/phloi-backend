const mongoose = require('mongoose');
require('dotenv').config()

const CommunicationStyle = require('../models/communicationStyleModel');
const DrinkFrequency = require('../models/drinkFrequencyModel');
const Interests = require('../models/interestsModel');
const LoveReceive = require('../models/loveReceiveModel');
const RelationshipPreference = require('../models/relationshipPreferencesModel');
const SexualOrientation = require('../models/sexualOrientationModel');
const SmokeFrequency = require('../models/smokeFrequencyModel');
const WorkoutFrequency = require('../models/workoutFrequencyModel');

const communicationStyles = [
  { style: 'I stay on WhatsApp' },
  { style: 'Big-time texter' },
  { style: 'Phone caller' },
  { style: 'Bad texter' },
  { style: 'Video chatter' },
  { style: 'I am slow to answer on WhatsApp' },
  { style: 'Better in person' }
];

const drinkFrequencies = [
  { frequency: 'Not for me' },
  { frequency: 'Sober' },
  { frequency: 'Sober curious' },
  { frequency: 'On special occasions' },
  { frequency: 'Socially on weekends' },
  { frequency: 'Most nights' }
];

const interests = [
    { interest: 'Harry Potter' },
    { interest: 'Spa' },
    { interest: 'SoundCloud' },
    { interest: 'Gymnastics' },
    { interest: 'Ludo' },
    { interest: 'Maggi' },
    { interest: 'Biryani' },
    { interest: 'Basketball' },
    { interest: 'Heavy Metal' },
    { interest: 'House Parties' },
    { interest: 'Gin tonic' },
    { interest: 'Sushi' },
    { interest: 'Hot Yoga' },
    { interest: 'Biryani' },
    { interest: 'Meditation' },
    { interest: 'Spotify' },
    { interest: 'Hockey' },
    { interest: 'Slam Poetry' },
    { interest: 'Home Workout' },
    { interest: 'Theater' },
    { interest: 'Cafe Hopping ' },
    { interest: 'Sneakers' },
    { interest: 'Aquarium' },
    { interest: 'Instagram' },
    { interest: 'Hot Spring' },
    { interest: 'Walking' },
    { interest: 'Running' },
    { interest: 'Travell' },
    { interest: 'Language Exchange' },
    { interest: 'Movies' },
    { interest: 'Guitarists' },
    { interest: 'Social Development' },
];

const loveReceiveTypes = [
  { love_type: 'Thoughtful gesture' },
  { love_type: 'Presents' },
  { love_type: 'Touch' },
  { love_type: 'Compliments' },
  { love_type: 'Time together' }
];

const preferences = [
  { relationship_type: 'Long-term partner' },
  { relationship_type: 'Long-term open to short' },
  { relationship_type: 'Short-term open to long' },
  { relationship_type: 'Short-term fun' },
  { relationship_type: 'New friends' },
  { relationship_type: 'Still figuring it out' },
  { relationship_type: 'Single with kids' },
  { relationship_type: 'Single no kids' }
];

const orientation = [
  { orientation_type: 'Straight' },
  { orientation_type: 'Gay' },
  { orientation_type: 'Lesbian' },
  { orientation_type: 'Bisexual' },
  { orientation_type: 'Asexual' },
  { orientation_type: 'Demisexual' },
  { orientation_type: 'Pansexual' },
  { orientation_type: 'Queer' },
  { orientation_type: 'Bicurious' }
];

const smokeFrequencies = [
  { frequency: 'Social smoker' },
  { frequency: 'Smoke when drinking' },
  { frequency: 'Non-smoker' },
  { frequency: 'Smoker' },
  { frequency: 'Trying to quit' },
 
];

const workoutFrequencies = [
  { frequency: 'Everyday' },
  { frequency: 'Often' },
  { frequency: 'Sometimes' },
  { frequency: 'Never' }
];


async function syncCollection(dataArray, Model, modelName, uniqueKey) {
  const existingItems = await Model.find({});
  const existingKeys = new Set(existingItems.map(item => item[uniqueKey]));
  const incomingKeys = new Set(dataArray.map(item => item[uniqueKey]));


  const toDelete = [...existingKeys].filter(key => !incomingKeys.has(key));
  if (toDelete.length > 0) {
    await Model.deleteMany({ [uniqueKey]: { $in: toDelete } });
    console.log(`Removed documents from ${modelName}:`, toDelete);
  }


  for (let item of dataArray) {
    const query = { [uniqueKey]: item[uniqueKey] };
    const result = await Model.findOneAndUpdate(query, item, { upsert: true, new: true });
    console.log(`Upserted into ${modelName}: ${item[uniqueKey]}`);
  }
}

async function seedAllData() {
  try {
    await Promise.all([
      syncCollection(communicationStyles, CommunicationStyle, 'Communication Style', 'style'),
      syncCollection(drinkFrequencies, DrinkFrequency, 'Drink Frequency', 'frequency'),
      syncCollection(interests, Interests, 'Interest', 'interest'),
      syncCollection(loveReceiveTypes, LoveReceive, 'Love Receive Type', 'love_type'),
      syncCollection(preferences, RelationshipPreference, 'Relationship Preference', 'relationship_type'),
      syncCollection(orientation, SexualOrientation, 'Sexual Orientation', 'orientation_type'),
      syncCollection(smokeFrequencies, SmokeFrequency, 'Smoke Frequency', 'frequency'),
      syncCollection(workoutFrequencies, WorkoutFrequency, 'Workout Frequency', 'frequency')
    ]);
    console.log('All data synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing data:', error);
  } finally {
    mongoose.connection.close();
  }
}


mongoose
  .connect(process.env.PHLOI_DB_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    return seedAllData();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
