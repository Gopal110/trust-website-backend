const { body } = require('express-validator');

module.exports = [
  body('donorName')
    .trim()
    .notEmpty().withMessage('Donor name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Donor name must be between 2 and 80 characters'),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('amount')
    .notEmpty().withMessage('Donation amount is required')
    .isFloat({ gt: 0 }).withMessage('Donation amount must be a positive number')
];
