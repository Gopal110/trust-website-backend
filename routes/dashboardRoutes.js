const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Donation = require('../models/Donation');
const Volunteer = require('../models/Volunteer');
const Contact = require('../models/Contact');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Gallery = require('../models/Gallery');

// Get Statistics for Dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    const totalDonationsCount = await Donation.countDocuments();
    const totalVolunteersCount = await Volunteer.countDocuments();
    const totalMessagesCount = await Contact.countDocuments();
    const totalEventsCount = await Event.countDocuments();
    const totalBlogsCount = await Blog.countDocuments();
    const totalGalleryCount = await Gallery.countDocuments();

    // Get total amount donated (assuming 'amount' field exists)
    const donations = await Donation.find();
    const totalAmount = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    res.json({
      donations: { count: totalDonationsCount, amount: totalAmount },
      volunteers: totalVolunteersCount,
      messages: totalMessagesCount,
      events: totalEventsCount,
      blogs: totalBlogsCount,
      gallery: totalGalleryCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Recent Activities
router.get('/activities', auth, async (req, res) => {
  try {
    const recentDonations = await Donation.find().sort({ createdAt: -1 }).limit(3);
    const recentVolunteers = await Volunteer.find().sort({ createdAt: -1 }).limit(3);
    const recentMessages = await Contact.find().sort({ createdAt: -1 }).limit(3);

    const activities = [
      ...recentDonations.map(d => ({ id: d._id, type: 'Donation', name: d.donorName, createdAt: d.createdAt })),
      ...recentVolunteers.map(v => ({ id: v._id, type: 'Volunteer', name: v.name, createdAt: v.createdAt })),
      ...recentMessages.map(m => ({ id: m._id, type: 'Message', name: m.name, createdAt: m.createdAt }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
