let mongoose = require('mongoose')
const DrinkFrequency = require('../models/drinkFrequencyModel');

const drinkFrequencies = [
  { frequency: 'Not for me' },
  { frequency: 'Sober' },
  { frequency: 'Sober curious' },
  { frequency: 'On special occasions' },
  { frequency: 'Socially on weekends' },
  { frequency: 'Most nights' },
];

async function seedDrinkFrequencies() {
  try {
    for (let freq of drinkFrequencies) {
      const exists = await DrinkFrequency.findOne({ frequency: freq.frequency });
      if (exists) {
        console.log(`Drink frequency '${freq.frequency}' already exists.`);
      } else {
        await new DrinkFrequency(freq).save();
        console.log(`Inserted: ${freq.frequency}`);
      }
    }
  } catch (error) {
    console.error('Error seeding drink frequencies:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect("mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority").then(seedDrinkFrequencies);
