let mongoose = require('mongoose')
let questionSchema = new mongoose.Schema({
    step:{type:Number,default:null},
    text:{type:String,default:null},
},{timestamps:true})

module.exports = mongoose.model('question',questionSchema)