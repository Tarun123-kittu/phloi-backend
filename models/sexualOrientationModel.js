const mongoose = require('mongoose');

const sexualOrientationSchema = new mongoose.Schema({
  orientation_type: {
    type: String,
    required: [true, 'Orientation type is required'],
    unique: true, 
  },
},{timestamps:true});

const sexualOrientationModel = mongoose.model('sexual_orientation', sexualOrientationSchema);
module.exports = sexualOrientationModel;
