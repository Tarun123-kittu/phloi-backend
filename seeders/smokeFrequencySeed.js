let mongoose = require('mongoose')
const SmokeFrequency = require('../models/smokeFrequencyModel');

const smokeFrequencies = [
  { frequency: 'Social smoker' },
  { frequency: 'Smoke when drinking' },
  { frequency: 'Non-smoker' },
  { frequency: 'Smoker' },
  { frequency: 'Trying to quit' },
];

async function seedSmokeFrequencies() {
  try {
    for (let freq of smokeFrequencies) {
      const exists = await SmokeFrequency.findOne({ frequency: freq.frequency });
      if (exists) {
        console.log(`Smoke frequency '${freq.frequency}' already exists.`);
      } else {
        await new SmokeFrequency(freq).save();
        console.log(`Inserted: ${freq.frequency}`);
      }
    }
  } catch (error) {
    console.error('Error seeding smoke frequencies:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect('mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority').then(seedSmokeFrequencies);
