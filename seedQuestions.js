const mongoose = require('mongoose');
const config = require('./config/config');
const Heading = require('./models/headingsModel');
const Question = require('./models/questionsModel');

const headings = [
  { step: 7, text: 'Your sexual orientaion?', sub_headings: "" },
  { step: 8, text: 'What are you looking for ?', sub_headings: "All good if it changes.There's something for everyone." },
  { step: 11, text: 'What else makes you you?', sub_headings: "Dont hold back. Authenticity attracts auehtenticity." },
  { step: 12, text: 'Let\'s talk lifestyle habits', sub_headings: "Do their habits match yours? You go first." },
  { step: 13, text: 'What are you into?', sub_headings: "You like what you like. Now let everyone know." }

];

const questions = [
  { identify_text: "sexual_orientation", step: 7, text: 'sexual orientatioins', icon_image: '' },
  { identify_text: "relationship_type", step: 8, text: 'relationship type', icon_image: '' },
  { identify_text: "communication_style", step: 11, text: 'What is your communication style?', icon_image: 'https://phloii.s3.amazonaws.com/characterstics/communication.png/20241011_160208' },
  { identify_text: "love_receive", step: 11, text: 'How do you receive love?', icon_image: 'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/loveIcon.png/20241011_160242' },
  { identify_text: "drink_frequency", step: 12, text: 'How often do you drink?', icon_image: 'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/drinkIcon.png/20241011_160315' },
  { identify_text: "smoke_frequency", step: 12, text: 'How often do you smoke?',icon_image:'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/smokeIcon.png/20241011_160343' },
  { identify_text: "workout_frequency", step: 12, text: 'Do you work out?',icon_image:'https://phloii.s3.eu-north-1.amazonaws.com/characterstics/gymIcon.png/20241011_160422' },
  { identify_text: "interests", step: 13, text: 'What are you into?',icon_image:'' }
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
