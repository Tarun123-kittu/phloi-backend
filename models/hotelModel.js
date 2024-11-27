let mongoose = require('mongoose')

let hotelSchema = new mongoose.Schema({
    hotel_name:{type:String}
},{timestamps:true})

module.exports = mongoose.model('hotel',hotelSchema)