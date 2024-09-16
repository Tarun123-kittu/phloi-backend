const mongoose = require('mongoose');
const sexualOrientation = require('../models/sexualOrientationModel');
// const config = require("../config/config");

const orientation = [
  { orientation_type: 'Straight' },
  { orientation_type: 'Gay' },
  { orientation_type: 'Lesbian' },
  { orientation_type: 'Bisexual' },
  { orientation_type: 'Asexual' },
  { orientation_type: 'Demisexual' },
  { orientation_type: 'Pansexual' },
  { orientation_type: 'Queer' },
  { orientation_type: 'Bicurious' },
];

async function seedSexualOrientation() {
  try {
    for (let pref of orientation) {
     
      const exists = await sexualOrientation.findOne({ orientation_type: pref.orientation_type });

      if (exists) {
        console.log(`Orientation '${pref.orientation_type}' already exists in the database.`);
      } else {
        const newOrientation = new sexualOrientation(pref);
        await newOrientation.save();
        console.log(`Inserted: ${pref.orientation_type}`);
      }
    }
  } catch (error) {
    console.error('Error seeding sexual orientation:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose
  .connect('mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
    return seedSexualOrientation();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
