let mongoose = require('mongoose')

let secretDatingUserSchema = new mongoose.Schema({
    username:{type:String,default:null},
    avatar:{type:String,default:null},

})