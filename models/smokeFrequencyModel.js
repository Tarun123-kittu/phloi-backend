const mongoose = require('mongoose');

const SmokeFrequencySchema = new mongoose.Schema({
  frequency: { type: String, required: true },
},{timestamps:true});

module.exports = mongoose.model('smoke_frequency', SmokeFrequencySchema);
