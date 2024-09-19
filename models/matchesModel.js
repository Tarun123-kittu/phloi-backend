const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    createdAt: { type: Date, default: Date.now }, 
    lastMessageAt: { type: Date, default: null },   
});

module.exports = mongoose.model('Match', matchSchema);
