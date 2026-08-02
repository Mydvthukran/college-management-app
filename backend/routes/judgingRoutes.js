const express = require('express');
const JudgingScore = require('../models/JudgingScore');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const mongoose = require('mongoose');

// 1. Submit a score from the Judging Panel
router.post('/submit', auth, requireRole('Organizer', 'Admin', 'Teacher'), async (req, res) => {
  try {
    const { eventId, registrationId, scores } = req.body;
    const judgeId = req.user.id;
    
    const totalScore = scores.innovation + scores.presentation + scores.technicalDepth;

    const newScore = new JudgingScore({
      eventId,
      judgeId,
      registrationId,
      scores,
      totalScore
    });

    await newScore.save();

    res.status(201).json({ message: 'Score submitted successfully', score: newScore });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Judge has already scored this participant for this event.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// 2. Get Leaderboard for an Event
router.get('/leaderboard/:eventId', async (req, res) => {
  try {
    const scores = await JudgingScore.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(req.params.eventId) } },
      { $group: { _id: '$registrationId', totalPoints: { $sum: '$totalScore' } } },
      { $sort: { totalPoints: -1 } }
    ]);

    // Lookup registration details (teamName or studentName)
    const Registration = require('../models/Registration');
    const populatedScores = await Registration.populate(scores, { path: '_id', select: 'teamName studentId', populate: { path: 'studentId', select: 'name' } });
    
    res.json(populatedScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
