let mongoose = require('mongoose')
let questionSchema = new mongoose.Schema({
    step:{type:Number,default:null},
    identify_text:{ type: String, required: true },
    text:{type:String,default:null},
},{timestamps:true})

module.exports = mongoose.model('question',questionSchema)