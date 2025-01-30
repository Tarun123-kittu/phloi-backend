const mongoose = require('mongoose');

const hotelAccountsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    password_reset_token: { type: String },
    forgetPsd_tokenCreatedAt: { type: Date },
    image:{type:String},
    phoneNumber:{type:Number}
}, { timestamps: true });

module.exports = mongoose.model('hotel_account', hotelAccountsSchema);
