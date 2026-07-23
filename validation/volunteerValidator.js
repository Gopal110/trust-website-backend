// server/validation/volunteerValidator.js
const { body } = require('express-validator');

module.exports = [
  // Full Name: required, letters and spaces only
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .matches(/^[A-Za-z\s]+$/).withMessage('Full name can only contain letters and spaces'),
  // Mobile Number: required, exactly 10 digits
  body('mobile')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^\d{10}$/).withMessage('Mobile number must be exactly 10 digits'),
  // Email: required, valid email format
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  // Age: required, between 18 and 80
  body('age')
    .trim()
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 18, max: 80 }).withMessage('Age must be between 18 and 80'),
  // City: required, letters and spaces only
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .matches(/^[A-Za-z\s]+$/).withMessage('City can only contain letters and spaces'),
  // Occupation: required
  body('occupation')
    .trim()
    .notEmpty().withMessage('Occupation is required'),
  // Skills: at least one skill required (array length >=1)
  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill must be selected')
];
