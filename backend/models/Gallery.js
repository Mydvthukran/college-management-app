const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['Photo', 'Video'], default: 'Photo' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
