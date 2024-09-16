let mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    username:{type:String,default:null},
    mobile_number :{type:Number,default:null},
    email:{type:String,default:null},
    dob:{type:Date,default:null},
    gender:{type:String,enum:["women","men","other"]},
    schooling:{type:String,default:null},
    intrested_to_see:{type:String,enum:['men',"women","everyone"],default:'everyone'},
},{timestamps:true}) 

let userModel = mongoose.model('User',userSchema)
module.exports = userModel