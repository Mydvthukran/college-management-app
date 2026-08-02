const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, enum: ['All', 'Student', 'Teacher', 'Organizer'], default: 'All' },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
