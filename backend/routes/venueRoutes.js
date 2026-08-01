const express = require('express');
const Venue = require('../models/Venue');
const Event = require('../models/Event');
const router = express.Router();

// 1. Get all Venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Check Venue Availability (Conflict Resolver)
router.post('/check-availability', async (req, res) => {
  try {
    const { venueId, date, startTime, endTime } = req.body;
    
    // Find any event in the same venue on the same date that overlaps in time
    const overlappingEvents = await Event.find({
      venueId,
      date: new Date(date),
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (overlappingEvents.length > 0) {
      return res.status(409).json({ available: false, message: 'Venue is already booked for this time slot.' });
    }

    res.json({ available: true, message: 'Venue is available.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
