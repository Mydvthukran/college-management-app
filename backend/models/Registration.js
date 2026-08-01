const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  checkedIn: { type: Boolean, default: false },
  checkInTime: { type: Date },
  certificateGenerated: { type: Boolean, default: false },
  certificateUrl: { type: String }, // Path or URL to the generated PDF
}, { timestamps: true });

// Prevent duplicate registrations
registrationSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
