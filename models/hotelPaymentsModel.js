let mongoose = require('mongoose');

let hotelPaymentSchema = new mongoose.Schema(
    {
        hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
        transactionId: { type: String, required: true },
        subscriptionId: { type: String },
        customerId: { type: String },
        paymentAmount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        paymentMethod: { type: String, default: 'card', required: true },
        paymentDate: { type: Date, default: Date.now },
        subscriptionEndDate:{type:Date},
        receiptUrl: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('hotel_payment', hotelPaymentSchema)
