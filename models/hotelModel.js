const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
    forgetPsd_otp:Number,
    forgetPsd_otpCreatedAt:Date,
    forgetPsd_otpVerified:  { type: Boolean, default: false },

    establishmentName: String,
    typeOfEstablishment: String,
    streetAddress: String,
    suiteNumber: String,
    country: String,
    state: String,
    pinCode: String,
    ownerName: String,
    websiteLink: String,
    ownerPhone: String,
    ownerEmail: String,
    description: String,
    images: [String],
    uniqueAttributes: String,
    safeWord: String,
    inPersonVisit: String,
    paymentStatus: { type: Boolean, default: false },
    adminVerificationStatus: { type: String, default: 'pending' }, // 'pending', 'verified', or 'rejected'
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
