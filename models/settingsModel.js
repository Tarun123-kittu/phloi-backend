const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, required: true },
}, { timestamps: true });

const sectionSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true },
  pages: [pageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Settings', sectionSchema);
