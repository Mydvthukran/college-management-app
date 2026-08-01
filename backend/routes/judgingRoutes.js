const express = require('express');
const JudgingScore = require('../models/JudgingScore');
const router = express.Router();

// 1. Submit a score from the Judging Panel
router.post('/submit', async (req, res) => {
  try {
    const { eventId, judgeId, participantId, scores } = req.body;
    
    const totalScore = scores.innovation + scores.presentation + scores.technicalDepth;

    const newScore = new JudgingScore({
      eventId,
      judgeId,
      participantId,
      scores,
      totalScore
    });

    await newScore.save();

    // If socket.io is configured globally, you can emit the new leaderboard here
    // req.app.get('io').to(eventId).emit('scoreUpdated', { participantId, totalScore });

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
      { $match: { eventId: require('mongoose').Types.ObjectId(req.params.eventId) } },
      { $group: { _id: '$participantId', totalPoints: { $sum: '$totalScore' } } },
      { $sort: { totalPoints: -1 } }
    ]);

    // In a real app, you would $lookup the User collection to get participant names
    res.json(scores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
