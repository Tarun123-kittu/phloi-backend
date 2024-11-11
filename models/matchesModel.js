const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    createdAt: { type: Date, default: Date.now }, 
    lastMessageAt: { type: Date, default: null }, 
    type:{type:String,enum:['secret dating','regular dating']},
    blocked_by:{type: mongoose.Schema.Types.ObjectId}
});

module.exports = mongoose.model('Match', matchSchema);
