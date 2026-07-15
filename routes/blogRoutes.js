const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', getAll(Blog));
router.get('/:id', getOne(Blog));
router.post('/', auth, createOne(Blog));
router.put('/:id', auth, updateOne(Blog));
router.delete('/:id', auth, deleteOne(Blog));

module.exports = router;
