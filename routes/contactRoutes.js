const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', auth, getAll(Contact));
router.get('/:id', auth, getOne(Contact));
router.post('/', (req, res, next) => {
  if (req.body.mobile && !req.body.phone) {
    req.body.phone = req.body.mobile;
  }
  next();
}, createOne(Contact)); // Public submission
router.put('/:id', auth, updateOne(Contact));
router.delete('/:id', auth, deleteOne(Contact));

module.exports = router;
