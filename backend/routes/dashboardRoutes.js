const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Student stats — events attended, certificates, attendance %
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalRegistrations = await Registration.countDocuments({ studentId: userId });
    const checkedIn = await Registration.countDocuments({ studentId: userId, checkedIn: true });
    const certificates = await Registration.countDocuments({ studentId: userId, certificateGenerated: true });
    const attendancePct = totalRegistrations > 0 ? Math.round((checkedIn / totalRegistrations) * 100) : 0;

    res.json({
      eventsAttended: checkedIn,
      totalRegistered: totalRegistrations,
      certificates,
      attendancePct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student's registered events with event details
router.get('/my-events', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ studentId: req.user.id })
      .populate({
        path: 'eventId',
        select: 'title date startTime endTime venue category eventStatus tags',
      })
      .sort({ createdAt: -1 });

    // Filter out any null eventId (deleted events)
    const events = registrations
      .filter(r => r.eventId)
      .map(r => ({
        registrationId: r._id,
        checkedIn: r.checkedIn,
        certificateGenerated: r.certificateGenerated,
        ...r.eventId.toObject(),
      }));

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI-like recommendations based on user interests matching event tags
router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const interests = user?.interests || [];

    // Find events the student is NOT registered for, matching their interest tags
    const registeredEventIds = (await Registration.find({ studentId: req.user.id }).select('eventId'))
      .map(r => r.eventId);

    let query = {
      _id: { $nin: registeredEventIds },
      eventStatus: { $in: ['Upcoming', 'Ongoing'] },
    };

    // If user has interests, prefer matching tags
    if (interests.length > 0) {
      query.tags = { $in: interests.map(i => i.toLowerCase()) };
    }

    let recommended = await Event.find(query).limit(6).sort({ date: 1 });

    // If not enough results from tag matching, fill with any upcoming events
    if (recommended.length < 3) {
      const fallback = await Event.find({
        _id: { $nin: [...registeredEventIds, ...recommended.map(r => r._id)] },
        eventStatus: { $in: ['Upcoming', 'Ongoing'] },
      }).limit(6 - recommended.length).sort({ date: 1 });
      recommended = [...recommended, ...fallback];
    }

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin stats
router.get('/admin-stats', auth, async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const pendingApprovals = await Event.countDocuments({ approvalChainStatus: { $in: ['Awaiting Faculty', 'Awaiting HOD'] } });
    const totalUsers = await User.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const checkedInCount = await Registration.countDocuments({ checkedIn: true });

    // Events by category
    const byCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Events by status
    const byStatus = await Event.aggregate([
      { $group: { _id: '$eventStatus', count: { $sum: 1 } } },
    ]);

    res.json({
      totalEvents,
      pendingApprovals,
      totalUsers,
      totalRegistrations,
      checkedInCount,
      attendancePct: totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0,
      byCategory,
      byStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
