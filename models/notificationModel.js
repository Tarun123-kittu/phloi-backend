let mongoose = require('mongoose')

let notificationSchema = new mongoose.Schema({
    userId :{type:mongoose.Schema.Types.ObjectId},
    sender_id:{type:mongoose.Schema.Types.ObjectId},
    notification_text:{type:String,default:null},
    read:{type:Boolean,default:false},
    type:{type:String,enum:['secret dating','regular dating','hotel']}
},{timestamps:true})

notificationSchema.index({ userId: 1, type: 1, read: 1 });

module.exports = mongoose.model('notification',notificationSchema)