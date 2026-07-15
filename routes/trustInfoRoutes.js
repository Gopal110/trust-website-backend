const express = require('express');
const router = express.Router();
const TrustInfo = require('../models/TrustInfo');
const { getAll, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', getAll(TrustInfo)); // Publicly available for site info
router.post('/', auth, createOne(TrustInfo)); // Should only be one, but create for setup
router.put('/:id', auth, updateOne(TrustInfo));
router.delete('/:id', auth, deleteOne(TrustInfo));

module.exports = router;
