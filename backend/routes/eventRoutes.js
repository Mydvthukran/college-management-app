const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT - simplified for demo
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token is not valid' });
  }
};

// Create Event (Club Lead)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'Club Lead') return res.status(403).json({ error: 'Not authorized' });
  try {
    const newEvent = new Event({ ...req.body, clubId: req.user.id });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('clubId', 'name');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Event (Admin)
router.put('/:id/approve', auth, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Not authorized' });
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for an event (Student) with Clash Check
router.post('/:id/register', auth, async (req, res) => {
  if (req.user.role !== 'Student') return res.status(403).json({ error: 'Only students can register' });
  try {
    const targetEvent = await Event.findById(req.params.id);
    
    // Clash logic check
    const existingRegistrations = await Registration.find({ studentId: req.user.id }).populate('eventId');
    const hasClash = existingRegistrations.some(reg => {
      const e = reg.eventId;
      return e.date.toISOString() === targetEvent.date.toISOString() &&
             ((targetEvent.startTime >= e.startTime && targetEvent.startTime < e.endTime) ||
              (targetEvent.endTime > e.startTime && targetEvent.endTime <= e.endTime));
    });

    if (hasClash) return res.status(400).json({ error: 'Timetable clash detected with another registered event.' });

    const newReg = new Registration({ studentId: req.user.id, eventId: req.params.id });
    await newReg.save();
    res.status(201).json({ message: 'Registered successfully', registration: newReg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
