const mongoose = require('mongoose')
const WorkoutFrequency = require('../models/workoutFrequencyModel');

const workoutFrequencies = [
  { frequency: 'Everyday' },
  { frequency: 'Often' },
  { frequency: 'Sometimes' },
  { frequency: 'Never' },
];

async function seedWorkoutFrequencies() {
  try {
    for (let freq of workoutFrequencies) {
      const exists = await WorkoutFrequency.findOne({ frequency: freq.frequency });
      if (exists) {
        console.log(`Workout frequency '${freq.frequency}' already exists.`);
      } else {
        await new WorkoutFrequency(freq).save();
        console.log(`Inserted: ${freq.frequency}`);
      }
    }
  } catch (error) {
    console.error('Error seeding workout frequencies:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect("mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority").then(seedWorkoutFrequencies);
