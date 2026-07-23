// server/validation/donationValidator.js
const { body } = require('express-validator');

module.exports = [
  // Donor Name: required, 3-60 chars, alphabets and spaces only
  body('donorName')
    .trim()
    .notEmpty().withMessage('Donor name is required')
    .isLength({ min: 3, max: 60 }).withMessage('Donor name must be between 3 and 60 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Donor name can only contain letters and spaces'),
  // Mobile Number: required, exactly 10 digits
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .isLength({ min: 10, max: 10 }).withMessage('Mobile number must be exactly 10 digits')
    .matches(/^\d{10}$/).withMessage('Mobile number must contain digits only'),
  // Donation Amount: required, positive number
  body('amount')
    .trim()
    .notEmpty().withMessage('Donation amount is required')
    .isFloat({ gt: 0 }).withMessage('Donation amount must be a positive number')
];
