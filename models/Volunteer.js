const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  age: { type: Number },
  occupation: { type: String },
  skills: [{ type: String }],
  availability: { type: String, enum: ['Full Time', 'Part Time'], default: 'Part Time' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
