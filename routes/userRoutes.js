const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const trimmedUsername = username.trim();
    const user = await User.findOne({ username: trimmedUsername });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ Server error: JWT_SECRET environment variable is missing.');
      return res.status(500).json({ message: 'Server authentication configuration error' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      jwtSecret,
      { expiresIn: '1d' }
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

// Admin Registration (Protected: only authenticated admin can register new accounts)
router.post('/register', auth, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const trimmedUsername = username.trim();
    const userExists = await User.findOne({ username: trimmedUsername });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      username: trimmedUsername,
      password,
      role: role || 'admin'
    });

    await newUser.save();
    return res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// Reset Password (Protected: only authenticated user can reset their password)
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
