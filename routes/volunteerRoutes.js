const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const { getAll, getOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');
const { volunteerValidation } = require('../validation/volunteerValidator');
const { validationResult } = require('express-validator');

// Public form: map frontend field names (fullName, mobile, interests) to model fields (name, phone, skills)
router.post('/', volunteerValidation, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { fullName, mobile, interests, ...rest } = req.body;
  const volunteerData = {
    ...rest,
    name: fullName || req.body.name,
    phone: mobile || req.body.phone,
    skills: interests || req.body.skills || []
  };
  req.volunteerData = volunteerData;
  next();
}, async (req, res) => {
  try {
    const volunteer = new Volunteer(req.volunteerData);
    const saved = await volunteer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.get('/', getAll(Volunteer));
router.get('/:id', getOne(Volunteer));
router.put('/:id', auth, updateOne(Volunteer));
router.delete('/:id', auth, deleteOne(Volunteer));

module.exports = router;
