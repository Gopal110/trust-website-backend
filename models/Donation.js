const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  amount: { type: Number, required: true },
  transactionId: { type: String },
  paymentMethod: { type: String, default: 'Offline' },
  cause: { type: String },
  address: { type: String },
  message: { type: String },
  status: { type: String, enum: ['Pending', 'Verified', 'Flagged'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
