const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  phone: { type: String, default: '7668473135' },
  resetOtpHash: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },
  resetOtpAttempts: { type: Number, default: 0 },
  lastOtpSentAt: { type: Date, default: null },
  resetSessionToken: { type: String, default: null },
  resetSessionExpires: { type: Date, default: null }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
