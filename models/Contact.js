const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  // 'phone' is the canonical field; route maps 'mobile' → 'phone' before save
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  // Store original 'mobile' field as well so nothing is lost
  mobile: {
    type: String,
    trim: true
  },
  subject: { type: String, trim: true },
  message: { type: String, required: [true, 'Message is required'], trim: true },
  status: { type: String, enum: ['New', 'Read', 'Resolved'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
