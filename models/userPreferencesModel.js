const mongoose = require('mongoose');

const UserPreferencesSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  sexual_orientation_preferece_id: { type: mongoose.Schema.Types.ObjectId, ref: 'sexual_orientation' }, 
  relationship_type_preference_id: { type: mongoose.Schema.Types.ObjectId, ref: 'relationship_preference' },
  distance_preference: { type: mongoose.Schema.Types.ObjectId, ref: 'relationship_preference' },
});

module.exports = mongoose.model('user_preferences', UserPreferencesSchema);
