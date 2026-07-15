const mongoose = require('mongoose');

const trustInfoSchema = new mongoose.Schema({
  registrationNumber: { type: String },
  panNumber: { type: String },
  info80G: { type: String },
  info12A: { type: String },
  address: { type: String },
  phone: [{ type: String }],
  email: { type: String },
  upiQrUrl: { type: String },
  bankDetails: {
    accountName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branch: { type: String }
  },
  googleMapLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('TrustInfo', trustInfoSchema);
