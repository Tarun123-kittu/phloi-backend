const mongoose = require('mongoose');
const { Schema } = mongoose;


const pageSchema = new Schema({
    title: { type: String, required: true },   
    content: { type: String, required: true },  
    slug: { type: String, required: true, unique: true }  
});


const settingSchema = new Schema({
    section: { type: String, required: true },  
    pages: [pageSchema]  
}, {
    timestamps: true
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
