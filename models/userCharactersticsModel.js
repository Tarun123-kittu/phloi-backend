const mongoose = require('mongoose');

const UserCharactersticsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
  communication_style_id: { type: mongoose.Schema.Types.ObjectId, ref: 'communication_style' }, 
  love_receive_id: { type: mongoose.Schema.Types.ObjectId, ref: 'love_receive' },
  drink_frequency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'drink_frequency' },
  smoke_frequency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'smoke_frequency' },
  workout_frequency_id: { type: mongoose.Schema.Types.ObjectId, ref: 'workout_frequency' },
  interests_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interests' }],
  
});

module.exports = mongoose.model('user_characterstics', UserCharactersticsSchema);
