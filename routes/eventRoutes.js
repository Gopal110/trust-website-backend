const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');
const { eventValidation } = require('../validation/eventValidator');
const { validationResult } = require('express-validator');

router.get('/', getAll(Event));
router.get('/:id', getOne(Event));

router.post('/', auth, eventValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}, createOne(Event));

router.put('/:id', auth, updateOne(Event));
router.delete('/:id', auth, deleteOne(Event));

module.exports = router;
