let mongoose = require('mongoose')
const Interests = require('../models/interestsModel');

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

async function seedInterests() {
  try {
    for (let interest of interests) {
      const exists = await Interests.findOne({ interest: interest.interest });
      if (exists) {
        console.log(`Interest '${interest.interest}' already exists.`);
      } else {
        await new Interests(interest).save();
        console.log(`Inserted: ${interest.interest}`);
      }
    }
  } catch (error) {
    console.error('Error seeding interests:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect('mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority').then(seedInterests);
