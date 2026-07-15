// galleryRoutes.js
const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', getAll(Gallery));
router.get('/:id', getOne(Gallery));
router.post('/', auth, createOne(Gallery));
router.put('/:id', auth, updateOne(Gallery));
router.delete('/:id', auth, deleteOne(Gallery));

module.exports = router;
