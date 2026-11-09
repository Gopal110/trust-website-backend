const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendOtpSms } = require('../utils/sms');
const { sendOtpEmail } = require('../utils/email');

// Helper: Normalize mobile number to 10 digits
function normalizeMobile(m) {
  if (!m) return '';
  return String(m).replace(/\D/g, '').slice(-10);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ADMIN LOGIN
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const trimmedUsername = username.trim();
    // Case-insensitive lookup so GOPAL_DIXIT or gopal_dixit works seamlessly
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'mynameisgopal';
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. FORGOT PASSWORD - STEP 1: REQUEST OTP (Send OTP to Registered Mobile)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password/request-otp', async (req, res) => {
  try {
    const { username, mobile } = req.body;
    if (!username || !mobile) {
      return res.status(400).json({ message: 'Username and registered mobile number are required' });
    }

    const trimmedUsername = String(username).trim();
    const cleanMobile = normalizeMobile(mobile);

    if (cleanMobile.length !== 10) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number' });
    }

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });

    if (!user) {
      return res.status(404).json({ message: 'Admin account not found with this username' });
    }

    const userPhone = normalizeMobile(user.phone || '7668473135');
    if (userPhone !== cleanMobile) {
      return res.status(400).json({ message: 'Mobile number does not match registered admin number' });
    }

    // Rate Limiting: Minimum 60 seconds cooldown between OTP requests
    const now = new Date();
    if (user.lastOtpSentAt) {
      const elapsedSeconds = (now.getTime() - new Date(user.lastOtpSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remaining = Math.ceil(60 - elapsedSeconds);
        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting a new OTP`
        });
      }
    }

    // Generate secure 6-digit OTP (100000 - 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user OTP fields
    user.resetOtpHash = otpHash;
    user.resetOtpExpires = otpExpires;
    user.resetOtpAttempts = 0;
    user.lastOtpSentAt = now;
    user.resetSessionToken = null;
    user.resetSessionExpires = null;
    await user.save();

    // Attempt sending OTP via SMS
    const smsResult = await sendOtpSms(cleanMobile, otp);

    // Also attempt sending OTP via Email if configured
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER || 'sscdms.trust@gmail.com';
    let emailResult = { success: false };
    if (!smsResult.success) {
      emailResult = await sendOtpEmail(adminEmail, otp);
    }

    if (!smsResult.success && !emailResult.success) {
      // Per prompt instructions: Explain what credentials are required, do not pretend OTP was sent.
      return res.status(503).json({
        message: 'Neither SMS nor Email OTP service is configured on Render backend.',
        gatewayConfigured: false,
        hint: 'Please configure EMAIL_USER and EMAIL_PASS (Gmail App Password) or MSG91_AUTH_KEY / TWILIO credentials in your Render environment variables.'
      });
    }

    const deliveryMethod = smsResult.success ? `mobile ending in ${cleanMobile.slice(-4)}` : `email ${adminEmail}`;

    return res.status(200).json({
      message: `OTP sent successfully to ${deliveryMethod}.`,
      expiresIn: 300,
      gatewayConfigured: true
    });
  } catch (err) {
    console.error('Request OTP error:', err.message);
    return res.status(500).json({ message: 'Server error processing OTP request' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. FORGOT PASSWORD - STEP 2: VERIFY OTP
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.body;
    if (!username || !otp) {
      return res.status(400).json({ message: 'Username and OTP are required' });
    }

    const trimmedUsername = String(username).trim();
    const trimmedOtp = String(otp).trim();

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });

    if (!user) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    if (!user.resetOtpHash || !user.resetOtpExpires) {
      return res.status(400).json({ message: 'No OTP request found. Please request an OTP first.' });
    }

    // Check expiration
    if (new Date() > new Date(user.resetOtpExpires)) {
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Limit verification attempts (max 5)
    if (user.resetOtpAttempts >= 5) {
      user.resetOtpHash = null;
      user.resetOtpExpires = null;
      await user.save();
      return res.status(429).json({ message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new OTP.' });
    }

    // Verify hash
    const submittedHash = crypto.createHash('sha256').update(trimmedOtp).digest('hex');
    if (submittedHash !== user.resetOtpHash) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.resetOtpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. You have ${remaining} attempt(s) remaining.`
      });
    }

    // OTP Verified! Invalidate the OTP to prevent reuse and issue a temporary single-use Reset Token (10 min)
    const resetSessionToken = crypto.randomBytes(32).toString('hex');
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpAttempts = 0;
    user.resetSessionToken = resetSessionToken;
    user.resetSessionExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes to set new password
    await user.save();

    return res.status(200).json({
      message: 'OTP verified successfully.',
      resetSessionToken
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    return res.status(500).json({ message: 'Server error verifying OTP' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. FORGOT PASSWORD - STEP 3: RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password/reset-password', async (req, res) => {
  try {
    const { username, resetSessionToken, newPassword } = req.body;
    if (!username || !resetSessionToken || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const trimmedUsername = String(username).trim();
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });

    if (!user) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    // Security check: Must have a valid, unexpired resetSessionToken
    if (!user.resetSessionToken || user.resetSessionToken !== resetSessionToken) {
      return res.status(403).json({ message: 'Invalid or unauthorized reset session. Please verify OTP again.' });
    }

    if (new Date() > new Date(user.resetSessionExpires)) {
      user.resetSessionToken = null;
      user.resetSessionExpires = null;
      await user.save();
      return res.status(403).json({ message: 'Reset session expired. Please verify OTP again.' });
    }

    // Update password (User.pre('save') handles bcrypt hashing)
    user.password = newPassword;
    user.resetSessionToken = null;
    user.resetSessionExpires = null;
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    return res.status(500).json({ message: 'Server error resetting password' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PROTECTED ADMIN REGISTRATION & PASSWORD CHANGE
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', auth, async (req, res) => {
  try {
    const { username, password, role, phone } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const trimmedUsername = username.trim();
    const userExists = await User.findOne({
      username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      username: trimmedUsername,
      password,
      role: role || 'admin',
      phone: normalizeMobile(phone) || '7668473135'
    });

    await newUser.save();
    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/reset-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    return res.status(500).json({ message: 'Server error during password update' });
  }
});

module.exports = router;
