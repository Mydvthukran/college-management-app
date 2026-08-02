const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Create Event (Organizer or Club Lead)
router.post('/', auth, requireRole('Organizer', 'Club Lead', 'Admin'), async (req, res) => {
  try {
    const newEvent = new Event({ ...req.body, clubId: req.user.id });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.approvalChainStatus = req.query.status;
    if (req.query.eventStatus) filter.eventStatus = req.query.eventStatus;
    if (req.query.category) filter.category = req.query.category;

    const events = await Event.find(filter)
      .populate('clubId', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events (today + next 7 days)
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const events = await Event.find({
      date: { $gte: today, $lte: nextWeek },
      approvalChainStatus: 'Approved',
    })
      .populate('clubId', 'name')
      .sort({ date: 1 });

    // Split into today and rest of week
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const todayEvents = events.filter(e => e.date <= endOfToday);
    const weekEvents = events.filter(e => e.date > endOfToday);

    // Get registration counts for each event
    const eventIds = events.map(e => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    regCounts.forEach(r => { countMap[r._id.toString()] = r.count; });

    const addCounts = (list) => list.map(e => ({
      ...e.toObject(),
      registrationCount: countMap[e._id.toString()] || 0,
    }));

    res.json({
      today: addCounts(todayEvents),
      week: addCounts(weekEvents),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organizer's own events with registration counts
router.get('/my-events', auth, requireRole('Organizer', 'Club Lead', 'Admin'), async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.user.id }).sort({ date: -1 });

    const eventIds = events.map(e => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    regCounts.forEach(r => { countMap[r._id.toString()] = r.count; });

    const result = events.map(e => ({
      ...e.toObject(),
      registrationCount: countMap[e._id.toString()] || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get registrations for an event
router.get('/:id/registrations', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('studentId', 'name email branch');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject Event (Admin)
router.put('/:id/approve', auth, requireRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { approvalChainStatus: status || 'Approved' },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for an event (Student) with Clash Check
router.post('/:id/register', auth, async (req, res) => {
  try {
    const targetEvent = await Event.findById(req.params.id);
    if (!targetEvent) return res.status(404).json({ error: 'Event not found' });

    // Check capacity
    if (targetEvent.capacityLimit) {
      const currentCount = await Registration.countDocuments({ eventId: req.params.id });
      if (currentCount >= targetEvent.capacityLimit) {
        return res.status(400).json({ error: 'Event is full.' });
      }
    }

    // Clash logic check
    const existingRegistrations = await Registration.find({ studentId: req.user.id }).populate('eventId');
    const hasClash = existingRegistrations.some(reg => {
      const e = reg.eventId;
      if (!e) return false;
      return e.date.toISOString() === targetEvent.date.toISOString() &&
             ((targetEvent.startTime >= e.startTime && targetEvent.startTime < e.endTime) ||
              (targetEvent.endTime > e.startTime && targetEvent.endTime <= e.endTime));
    });

    if (hasClash) return res.status(400).json({ error: 'Timetable clash detected with another registered event.' });

    const newReg = new Registration({ studentId: req.user.id, eventId: req.params.id });
    await newReg.save();
    res.status(201).json({ message: 'Registered successfully', registration: newReg });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already registered for this event.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Cancel registration
router.delete('/:id/register', auth, async (req, res) => {
  try {
    await Registration.findOneAndDelete({ studentId: req.user.id, eventId: req.params.id });
    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
