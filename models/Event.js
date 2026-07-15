const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  imageUrl: { type: String },
  status: { type: String, enum: ['Upcoming', 'Past', 'Campaign'], default: 'Upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
