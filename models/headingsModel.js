let mongoose = require('mongoose')
let headingsSchema = new mongoose.Schema({
    step:{type:Number,default:null},
    text:{type:String,default:null},

},{timestamps:true})

module.exports = mongoose.model('heading',headingsSchema)