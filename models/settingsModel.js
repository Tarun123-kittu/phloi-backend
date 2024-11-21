const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
});

const sectionSchema = new mongoose.Schema({
    section: { type: String, required: true },
    pages: [pageSchema]
});


module.exports = mongoose.model('Settings', sectionSchema);
