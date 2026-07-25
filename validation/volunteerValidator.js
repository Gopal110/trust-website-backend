const { body } = require('express-validator');

module.exports = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Full name must be 2-80 characters'),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('age')
    .optional({ checkFalsy: true })
    .isInt({ min: 14, max: 100 }).withMessage('Age must be a valid number between 14 and 100')
];
