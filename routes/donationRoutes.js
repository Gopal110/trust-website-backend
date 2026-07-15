const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const auth = require('../middleware/auth');

// Public route to submit donation details after payment
router.post('/submit', (req, res, next) => {
  if (req.body.mobile && !req.body.phone) {
    req.body.phone = req.body.mobile;
  }
  next();
}, donationController.createDonation);

// Admin only routes
router.get('/', auth, donationController.getAllDonations);
router.get('/:id', auth, donationController.getDonationById);
router.put('/:id', auth, donationController.updateDonationStatus);
router.delete('/:id', auth, donationController.deleteDonation);

module.exports = router;
