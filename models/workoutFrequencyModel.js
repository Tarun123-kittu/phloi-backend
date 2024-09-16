const mongoose = require('mongoose');

const WorkoutFrequencySchema = new mongoose.Schema({
  frequency: { type: String, required: true },
},{timestamps:true});

module.exports = mongoose.model('workout_frequency', WorkoutFrequencySchema);
