const mongoose = require('mongoose');

const CommunicationStyleSchema = new mongoose.Schema({
  style: { type: String, required: true },
},{timestamps:true});

module.exports = mongoose.model('communication_style', CommunicationStyleSchema);
