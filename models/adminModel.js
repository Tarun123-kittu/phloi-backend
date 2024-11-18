let mongoose = require('mongoose')

let adminSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    password:{type:String}  
}, { timestamps: true })

module.exports = mongoose.model('admin', adminSchema)