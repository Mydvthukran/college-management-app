const express = require('express');
const Announcement = require('../models/Announcement');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Create announcement (Organizer or Admin)
router.post('/', auth, requireRole('Organizer', 'Admin'), async (req, res) => {
  try {
    const { message, eventId, targetRole } = req.body;
    const announcement = new Announcement({
      message,
      eventId: eventId || null,
      createdBy: req.user.id,
      targetRole: targetRole || 'All',
    });
    await announcement.save();
    const populated = await announcement.populate([
      { path: 'createdBy', select: 'name role' },
      { path: 'eventId', select: 'title' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all announcements (anyone authenticated)
router.get('/', auth, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('createdBy', 'name role')
      .populate('eventId', 'title');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get announcements by the logged-in organizer
router.get('/my', auth, requireRole('Organizer', 'Admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('eventId', 'title');
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
