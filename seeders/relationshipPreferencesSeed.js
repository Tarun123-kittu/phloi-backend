const mongoose = require('mongoose');
const RelationshipPreference = require('../models/relationshipPreferencesModel');
// const config = require("../config/config")


const preferences = [
  { relationship_type: 'Long-term partner' },
  { relationship_type: 'Long-term open to short'},
  { relationship_type: 'Short-term open to long' },
  { relationship_type: 'Short-term fun' },
  { relationship_type: 'New frields' },
  { relationship_type: 'Still figuring it out' },
  { relationship_type: 'Single with kids' },
  { relationship_type: 'Single no kids' },
];



async function seedRelationshipPreferences() {
  try {
    for (let pref of preferences) {
      const exists = await RelationshipPreference.findOne({ relationship_type: pref.relationship_type });

      if (exists) {
        console.log(`Preference '${pref.relationship_type}' already exists in the database.`);
      } else {
        const newPreference = new RelationshipPreference(pref);
        await newPreference.save();
        console.log(`Inserted: ${pref.relationship_type}`);
      }
    }
  } catch (error) {
    console.error('Error seeding relationship preferences:', error);
  } finally {
    mongoose.connection.close();
  }
}


mongoose
  .connect('mongodb+srv://hankishbawa17:123%40hankish@phloi.kg8i2.mongodb.net/phloi?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB');
    return seedRelationshipPreferences();
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
