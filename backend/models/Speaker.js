const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  biography: { type: String, required: true },
  contactDetails: { type: String },
  profilePictureUrl: { type: String },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  schedule: { type: String } // e.g., "10:00 AM - Keynote"
}, { timestamps: true });

module.exports = mongoose.model('Speaker', speakerSchema);
