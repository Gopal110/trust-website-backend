const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  imageUrl: { type: String, required: true },
  category: { type: String, enum: ['Photos', 'Videos', 'Events', 'Social Work'], default: 'Photos' },
  type: { type: String, enum: ['image', 'video'], default: 'image' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
