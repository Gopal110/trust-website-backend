const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', getAll(Banner));
router.get('/:id', getOne(Banner));
router.post('/', auth, createOne(Banner));
router.put('/:id', auth, updateOne(Banner));
router.delete('/:id', auth, deleteOne(Banner));

module.exports = router;
