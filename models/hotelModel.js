let mongoose = require('mongoose')

let hotelSchema = new mongoose.Schema({


},{timestamps:true})

module.exports = mongoose.model('hotel',hotelSchema)