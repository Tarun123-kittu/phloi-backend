let mongoose = require('mongoose')

let chatHotelRecords = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId },
    messageId:{type:mongoose.Schema.Types.ObjectId },
    status:{type:String,enum:['accept','reject','pending'],default:'pending'}
},{timestamps:true})

module.exports = mongoose.model('chat_hotel_record',chatHotelRecords)