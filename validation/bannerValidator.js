// server/validation/bannerValidator.js
const { body } = require('express-validator');

const bannerValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('subtitle')
    .optional({ checkFalsy: true })
    .isLength({ max: 150 }).withMessage('Subtitle cannot exceed 150 characters'),
  body('imageUrl')
    .trim()
    .notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Image URL must be a valid URL'),
  body('link')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Link must be a valid URL'),
  body('active')
    .optional({ checkFalsy: true })
    .isBoolean().withMessage('Active must be a boolean')
];

module.exports = { bannerValidation };
