// server/validation/contactValidator.js
const { body } = require('express-validator');

const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters')
    .matches(/^[A-Za-z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 digits')
    .isNumeric().withMessage('Phone number must contain only digits'),
  body('subject')
    .optional({ checkFalsy: true })
    .isLength({ max: 150 }).withMessage('Subject cannot exceed 150 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10-2000 characters')
];

module.exports = { contactValidation };
