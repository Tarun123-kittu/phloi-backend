let mongoose = require('mongoose')

let hotelInvitationsModel = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId },
    messageId:{type:mongoose.Schema.Types.ObjectId },
    status:{type:String,enum:['accept','reject','pending'],default:'pending'}
},{timestamps:true})

module.exports = mongoose.model('hotel_invitation',hotelInvitationsModel)