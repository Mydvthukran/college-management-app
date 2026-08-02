const mongoose = require('mongoose');

const judgingScoreSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', required: true },
  scores: {
    innovation: { type: Number, required: true, min: 0, max: 10 },
    presentation: { type: Number, required: true, min: 0, max: 10 },
    technicalDepth: { type: Number, required: true, min: 0, max: 10 }
  },
  totalScore: { type: Number, required: true }
}, { timestamps: true });

// Ensure a judge can only score a registration once per event
judgingScoreSchema.index({ eventId: 1, judgeId: 1, registrationId: 1 }, { unique: true });

module.exports = mongoose.model('JudgingScore', judgingScoreSchema);
