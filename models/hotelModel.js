const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotelAccountId: { type: mongoose.Schema.Types.ObjectId },
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

hotelSchema.index({ hotelAccountId: 1, adminVerified: 1, createdAt: -1, updatedAt: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);
