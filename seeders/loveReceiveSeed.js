const mongoose = require('mongoose')
const LoveReceive = require('../models/loveReceiveModel');

const loveReceiveTypes = [
  { love_type: 'Thoughtful gesture' },
  { love_type: 'Presents' },
  { love_type: 'Touch' },
  { love_type: 'Compliments' },
  { love_type: 'Time together' },
];

async function seedLoveReceiveTypes() {
  try {
    for (let type of loveReceiveTypes) {
      const exists = await LoveReceive.findOne({ love_type: type.love_type });
      if (exists) {
        console.log(`Love receive type '${type.love_type}' already exists.`);
      } else {
        await new LoveReceive(type).save();
        console.log(`Inserted: ${type.love_type}`);
      }
    }
  } catch (error) {
    console.error('Error seeding love receive types:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect('mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority').then(seedLoveReceiveTypes);
