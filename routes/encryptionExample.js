// Example usage of encryption in routes
// This file demonstrates how to use the encryption utility for protecting sensitive data

const express = require('express');
const router = express.Router();
const { encrypt, decrypt, hash, generateToken } = require('../utils/encryption');
const Contact = require('../models/Contact'); // Example model

/**
 * Example 1: Save encrypted contact information
 * 
 * This protects personally identifiable information (PII)
 * like phone numbers, emails, addresses
 */
router.post('/secure-contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Encrypt sensitive fields
    const encryptedPhone = encrypt(phone);
    const encryptedEmail = encrypt(email);

    const contact = new Contact({
      name,
      email: encryptedEmail,
      phone: encryptedPhone,
      message
    });

    await contact.save();

    res.status(201).json({
      message: 'Contact saved securely',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Example 2: Retrieve and decrypt sensitive data
 * 
 * When fetching data, decrypt encrypted fields for display
 */
router.get('/secure-contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Decrypt sensitive fields before sending to client
    const decryptedContact = {
      ...contact.toObject(),
      email: decrypt(contact.email),
      phone: decrypt(contact.phone)
    };

    res.json(decryptedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Example 3: Generate secure tokens for password reset
 * 
 * Use generateToken for creating secure reset links
 */
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = generateToken(32);
    const tokenHash = hash(resetToken);

    // Store hashed token in database (never store plaintext tokens)
    // In actual use, you'd save this to a ResetToken model with expiry
    
    res.json({
      message: 'Reset link sent to email',
      // In production, send this via email, not response
      resetLink: `https://yourapp.com/reset/${resetToken}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Example 4: Hash sensitive data for comparison
 * 
 * For data that needs comparison but should not be reversible
 */
router.post('/verify-secret', async (req, res) => {
  try {
    const { secret } = req.body;
    
    // Hash the provided secret
    const secretHash = hash(secret);
    
    // Compare with stored hash (in real scenario, fetch from DB)
    const storedHash = 'some_hash_from_database';
    
    if (secretHash === storedHash) {
      res.json({ verified: true });
    } else {
      res.status(401).json({ verified: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

/**
 * ============================================
 * INTEGRATION GUIDE
 * ============================================
 * 
 * 1. In your server.js, add this example route:
 *    const encryptionExampleRoutes = require('./routes/encryptionExample');
 *    app.use('/api/example', encryptionExampleRoutes);
 * 
 * 2. Set ENCRYPTION_KEY in .env:
 *    ENCRYPTION_KEY=your-super-secret-key-with-32-characters
 * 
 * 3. Use encryption in your existing models:
 *    - Contact model: encrypt phone, email, address
 *    - User model: already uses bcryptjs for passwords
 *    - Donation model: encrypt payment method, amount details
 * 
 * 4. Always decrypt before displaying to authenticated users
 * 
 * 5. Never store plaintext sensitive data
 */
