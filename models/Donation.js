const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { 
    type: String, 
    required: [true, 'Donor name is required'],
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
  amount: { type: Number, required: [true, 'Amount is required'], min: [1, 'Amount must be at least ₹1'] },
  transactionId: { type: String, trim: true },
  paymentMethod: { type: String, default: 'Offline' },
  cause: { type: String, trim: true },
  address: { type: String, trim: true },
  message: { type: String, trim: true },
  status: { type: String, enum: ['Pending', 'Verified', 'Flagged'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
