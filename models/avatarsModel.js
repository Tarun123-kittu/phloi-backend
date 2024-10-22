let mongoose = require('mongoose')

let avatarSchema = new mongoose.Schema({
    avatar_image:{type:String,default:null},
    gender:{type:String,enum:['male','female']}
},{timestamps:true})

module.exports = mongoose.model('avatar',avatarSchema)