const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { getAll, getOne, createOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', getAll(Event));
router.get('/:id', getOne(Event));
router.post('/', auth, createOne(Event));
router.put('/:id', auth, updateOne(Event));
router.delete('/:id', auth, deleteOne(Event));

module.exports = router;
