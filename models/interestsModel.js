const mongoose = require('mongoose');

const InterestsSchema = new mongoose.Schema({
  interest: { type: String, required: true },
},{timestamps:true});

module.exports = mongoose.model('Interests', InterestsSchema);
