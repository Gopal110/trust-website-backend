const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');
const { contactValidation } = require('../validation/contactValidator');
const { validationResult } = require('express-validator');

router.get('/', auth, getAll(Contact));
router.get('/:id', auth, getOne(Contact));

router.post('/', contactValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Frontend sends 'mobile'; map it to 'phone' so the DB model's required field is satisfied
  if (req.body.mobile && !req.body.phone) {
    req.body.phone = req.body.mobile;
  }
  // Also ensure mobile is set if only phone was provided
  if (req.body.phone && !req.body.mobile) {
    req.body.mobile = req.body.phone;
  }
  next();
}, createOne(Contact));

router.put('/:id', auth, updateOne(Contact));
router.delete('/:id', auth, deleteOne(Contact));

module.exports = router;
