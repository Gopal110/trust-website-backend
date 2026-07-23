const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');
const { bannerValidation } = require('../validation/bannerValidator');
const { validationResult } = require('express-validator');

router.get('/', getAll(Banner));
router.get('/:id', getOne(Banner));
router.post('/', auth, bannerValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createOne(Banner));
router.put('/:id', auth, updateOne(Banner));
router.delete('/:id', auth, deleteOne(Banner));

module.exports = router;
