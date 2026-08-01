const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  suggestions: { type: String },
  organizerResponse: { type: String }
}, { timestamps: true });

// A student can only submit feedback once per event
feedbackSchema.index({ eventId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
