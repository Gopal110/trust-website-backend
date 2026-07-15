const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  thumbnailUrl: { type: String },
  category: { type: String, default: 'General' },
  author: { type: String, default: 'Trust Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
