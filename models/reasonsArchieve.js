let mongoose = require('mongoose')

let reasonArchiveSchema = new mongoose.Schema({
    reason: { type: String },
    icon_image:{type:String},
    type: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('reason_archive', reasonArchiveSchema)