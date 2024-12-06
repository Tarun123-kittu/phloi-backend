const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
    read_chat: { type: Boolean, default: false },
    mediaType: { type: String },
    hotelData: {
        hotelId: { type: mongoose.Schema.Types.ObjectId },
        hotelName: { type: String },
        address: { type: String },
        hotelImage: { type: String },
        status: { type: String, enum: ['accept', 'reject', 'pending'] }
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
