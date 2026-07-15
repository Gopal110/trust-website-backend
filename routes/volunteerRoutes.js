const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const { getAll, getOne, updateOne, deleteOne } = require('../controllers/crudController');
const auth = require('../middleware/auth');

router.get('/', getAll(Volunteer));
router.get('/:id', getOne(Volunteer));
// Public form: map frontend field names (fullName, mobile, interests) to model fields (name, phone, skills)
router.post('/', async (req, res) => {
  try {
    const { fullName, mobile, interests, ...rest } = req.body;
    const volunteerData = {
      ...rest,
      name: fullName || req.body.name,
      phone: mobile || req.body.phone,
      skills: interests || req.body.skills || []
    };
    const volunteer = new Volunteer(volunteerData);
    const saved = await volunteer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put('/:id', auth, updateOne(Volunteer));
router.delete('/:id', auth, deleteOne(Volunteer));

module.exports = router;
