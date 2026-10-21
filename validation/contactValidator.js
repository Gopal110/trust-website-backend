const { body } = require('express-validator');

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),

  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),

  // Frontend sends 'mobile' — validate it directly
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),

  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 150 }).withMessage('Subject cannot exceed 150 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5, max: 2000 }).withMessage('Message must be 5-2000 characters'),
];

module.exports = { contactValidation };
