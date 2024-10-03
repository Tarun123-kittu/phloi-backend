const mongoose = require('mongoose');
const config = require('./config/config');  
const Heading = require('./models/headingsModel'); 
const Question = require('./models/questionsModel'); 

const headings = [
  { step: 7, text: 'Your sexual orientaion?' },
  { step: 8, text: 'What are you looking for ?' },
  { step: 11, text: 'What else makes you you?' },
  { step: 12, text: 'Let\'s talk lifestyle habits, Leo.' },
  { step: 13, text: 'What are you into?' }
  
];

const questions = [
  { step: 7, text: 'sexual orientatioins' },
  { step: 8, text: 'relationship type' },
  { step: 11, text: 'What is your communication style?' },
  { step: 11, text: 'How do you receive love?' },
  { step: 12, text: 'How often do you drink?' },
  { step: 12, text: 'How often do you smoke?' },
  { step: 12, text: 'Do you work out?' },
  { step: 13, text: 'What are you into?' }
];

async function syncCollection(dataArray, Model, modelName) {

  await Model.deleteMany({});
  console.log(`Removed all documents from ${modelName}.`);

  for (let item of dataArray) {
    const result = await Model.create(item);
    console.log(`Inserted into ${modelName}: ${result._id}`);
  }
}

async function seedAllData() {
  try {
    await Promise.all([
      syncCollection(headings, Heading, 'Heading'),
      syncCollection(questions, Question, 'Question')
    ]);
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
