const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    password_reset_token: { type: String },
    forgetPsd_tokenCreatedAt: { type: Date },
    // forgetPsd_tokenVerified: { type: Boolean, default: false },
   

    establishmentName: { type: String },
    establishmentType: { type: String },
    address: {
        streetAddress: { type: String },
        suiteUnitNumber: { type: String },
        country: { type: String },
        state: { type: String },
        pinCode: { type: String },
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
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);
