const mongoose = require('mongoose');

const trustInfoSchema = new mongoose.Schema({
  registrationNumber: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  info80G: { type: String, trim: true },
  info12A: { type: String, trim: true },
  address: { type: String, trim: true },
  phone: [{ type: String, trim: true }],
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  upiQrUrl: { type: String, trim: true },
  bankDetails: {
    accountName: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    branch: { type: String, trim: true }
  },
  googleMapLink: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('TrustInfo', trustInfoSchema);
