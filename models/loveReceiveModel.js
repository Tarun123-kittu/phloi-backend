const mongoose = require('mongoose');

const LoveReceiveSchema = new mongoose.Schema({
  love_type: { type: String, required: true },
},{timestamps:true});

module.exports = mongoose.model('love_receive', LoveReceiveSchema);
