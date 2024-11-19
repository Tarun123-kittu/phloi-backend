let mongoose = require('mongoose')

let adminSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password:{type:String},
    forgetPsd_otp:{type:Number},
    forgetPsd_otpCreatedAt:{type:Date},

}, { timestamps: true })

module.exports = mongoose.model('admin', adminSchema)