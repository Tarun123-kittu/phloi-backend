let mongoose = require('mongoose')

let reportReasonsSchema = new mongoose.Schema({
    reason: { type: String }
}, { timestamps: true })

module.exports = mongoose.model('report_reason',reportReasonsSchema)