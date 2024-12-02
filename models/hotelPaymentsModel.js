let mongoose = require('mongoose')

let hotelPaymentSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId },
    transactionId: { type: String },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }

}, { timestamps: true })

module.exports = mongoose.model('hotel_payment', hotelPaymentSchema)