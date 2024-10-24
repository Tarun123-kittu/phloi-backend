    let mongoose = require('mongoose')

    let settingSchema = new mongoose.Schema({
        heading:{type:String,default:null},
        type:{type:String,enum:['contact us','community','privacy','legal'],default:null},
        enable:{type:Boolean,default:true}
    },{timestamps:true})

    module.exports = mongoose.model('setting',settingSchema)