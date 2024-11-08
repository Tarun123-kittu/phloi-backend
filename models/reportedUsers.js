const mongoose = require('mongoose');

const reportedUsersSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportCount: { type: Number, default: 0 },
    reportDetails: [{
        user_who_reported: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        report_reason_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('ReportedUser', reportedUsersSchema);