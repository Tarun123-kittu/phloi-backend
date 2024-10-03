
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
    text: { type: String, required: true },
    emoji: { type: String, default: null }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Option', optionSchema);
