let mongoose = require('mongoose')

let roomsSchema = new mongoose.Schema({
    room:{type:String,default:null},
    image:{type:String,default:null},
    joined_user_count:{type:Number,default:0}
},{timestamps:true})

module.exports = mongoose.model('explore_rooms',roomsSchema)