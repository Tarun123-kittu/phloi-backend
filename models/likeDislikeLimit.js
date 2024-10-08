let mongoose = require('mongoose')

let likeDislikeLimitSchema = new mongoose.Schema({
    userId:{type:mongoose.Types.ObjectId},
    like_count:{type:Number,default:0},
    dislike_count:{type:Number,default:0},
},{timestamps:true})

module.exports = mongoose.model("like_dislike_limit",likeDislikeLimitSchema)