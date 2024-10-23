let mongoose = require('mongoose')

let notificationSchema = new mongoose.Schema({
    userId :{type:mongoose.Schema.Types.ObjectId},
    notification_text:{type:String,default:null},
    read:{type:Boolean,default:false}
},{timestamps:true})

module.exports = mongoose.model('notification',notificationSchema)