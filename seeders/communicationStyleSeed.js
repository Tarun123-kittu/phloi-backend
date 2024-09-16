const mongoose = require('mongoose');
const CommunicationStyle = require('../models/communicationStyleModel');
// const config = require("./config/config");

const communicationStyles = [
  { style: 'I stay on WhatsApp' },
  { style: 'Big-time texter' },
  { style: 'Phone caller' },
  { style: 'Bad texter' },
  { style: 'Video chatter' },
  { style: 'I am slow to answer on WhatsApp' },
  { style: 'Better in person' }

];

async function seedCommunicationStyles() {
  try {
    for (let style of communicationStyles) {
      const exists = await CommunicationStyle.findOne({ style: style.style });
      if (exists) {
        console.log(`Communication style '${style.style}' already exists.`);
      } else {
        await new CommunicationStyle(style).save();
        console.log(`Inserted: ${style.style}`);
      }
    }
  } catch (error) {
    console.error('Error seeding communication styles:', error);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connect('mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority').then(seedCommunicationStyles);
