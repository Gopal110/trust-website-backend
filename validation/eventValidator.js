// server/validation/eventValidator.js
const { body } = require('express-validator');

const eventValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid date'),
  body('location')
    .optional({ checkFalsy: true })
    .isLength({ max: 150 }).withMessage('Location cannot exceed 150 characters'),
  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Image URL must be a valid URL'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(['Upcoming', 'Past', 'Campaign']).withMessage('Invalid status value')
];

module.exports = { eventValidation };
