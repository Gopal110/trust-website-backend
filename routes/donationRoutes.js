const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');
const donationValidation = require('../validation/donationValidator');
const { validationResult } = require('express-validator');

// Public route to submit donation details after payment with validation
router.post(
  '/submit',
  donationValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Preserve existing mobile fallback logic
    if (req.body.mobile && !req.body.phone) {
      req.body.phone = req.body.mobile;
    }
    next();
  },
  donationController.createDonation
);

// Admin only routes
router.get('/', auth, donationController.getAllDonations);
router.get('/:id', auth, donationController.getDonationById);
router.put('/:id', auth, donationController.updateDonationStatus);
router.delete('/:id', auth, donationController.deleteDonation);

module.exports = router;
