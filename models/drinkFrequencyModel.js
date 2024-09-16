const mongoose = require('mongoose');

const DrinkFrequencySchema = new mongoose.Schema({
  frequency: { type: String, required: true },
},{timestamps:true});

module.exports = mongoose.model('drink_frequency', DrinkFrequencySchema);
