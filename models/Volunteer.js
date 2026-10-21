const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  age: { type: Number, min: 18, max: 80 },
  occupation: { type: String, trim: true },
  skills: [{ type: String }],
  availability: { type: String, enum: ['Full Time', 'Part Time'], default: 'Part Time' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
