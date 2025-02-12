const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotelAccountId: { type: mongoose.Schema.Types.ObjectId },
    establishmentName: { type: String },
    address: {
        streetAddress: { type: String },
        suiteUnitNumber: { type: Number },
        country: { type: String },
        state: { type: String },
        pinCode: { type: Number },
        city:{ type: String }
    },
    ownerDetails: {
        ownerName: { type: String },
        websiteLink: { type: String },
        ownerPhone: { type: Number },
        ownerEmail: { type: String },
    },
    why_want_phloi: { type: String },
    uniqueFeatures: { type: String },
    safeWord: { type: String },
    inPersonVisitAvailability: { type: String },
    images: [{ type: String }],
    onboardingCompleted: { type: Boolean, default: false },
    adminVerified: { type: Boolean,default:null },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    subscriptionEndDate: { type: Date },
    customerServiceNumber: { type: String },
    atmosphere: [{ type: String,default:null }],
    services: [{ type: String,default:null }],
    atmosphere_description:{type:String,default:null},
    food:{type:String,default:null},
    additional_information:{type:String,default:null},
    openCloseTimings: {
        open: { type: String },
        close: { type: String },
    },
    location: { type: { type: String, enum: ['Point'],  default: 'Point', }, coordinates: { type: [Number],  default: [0, 0], }, },

}, { timestamps: true });

hotelSchema.index({location: "2dsphere" , hotelAccountId: 1, adminVerified: 1, createdAt: -1, updatedAt: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);
