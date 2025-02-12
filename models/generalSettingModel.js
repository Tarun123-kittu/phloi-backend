let mongoose = require('mongoose')
let generalSettingSchema = new mongoose.Schema({
  maximum_distance:{type:Number,default:200},
  serchHotelsUnder:{type:Number,default:50}
},{timestamps:true})

module.exports = mongoose.model('general_setting',generalSettingSchema)