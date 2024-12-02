const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    password_reset_token: { type: String },
    forgetPsd_tokenCreatedAt: { type: Date },



    establishmentName: { type: String },
    establishmentType: { type: String },
    address: {
        streetAddress: { type: String },
        suiteUnitNumber: { type: Number },
        country: { type: String },
        state: { type: String },
        pinCode: { type: Number },
    },
    ownerDetails: {
        ownerName: { type: String },
        websiteLink: { type: String },
        ownerPhone: { type: String },
        ownerEmail: { type: String },
    },
    why_want_phloi: { type: String },
    uniqueFeatures: { type: String },
    safeWord: { type: String },
    inPersonVisitAvailability: { type: String },
    images: [{ type: String }],
    onboardingCompleted: { type: Boolean, default: false },
    adminVerified: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
