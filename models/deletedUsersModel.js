const mongoose = require('mongoose');

const deletedUsersSchema = new mongoose.Schema({
    user_mobile: { type: Number, ref: 'User', required: true },
    deleteCount: { type: Number, default: 0 },
    deleteAccountDetails: [{
        deleteAccount_reason_id: { type: mongoose.Schema.Types.ObjectId,default:null },
        deleteAccountReasonText:{type:String,default:null},
        deletedAt:{type:Date,default: Date.now}
    }]
}, { timestamps: true });

module.exports = mongoose.model('deleted_user', deletedUsersSchema);