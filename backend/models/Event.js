const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  tags: [{ type: String }], // For AI recommendations (e.g. 'robotics', 'AI', 'web dev')
  approvalChainStatus: { 
    type: String, 
    enum: ['Awaiting Faculty', 'Awaiting HOD', 'Approved', 'Rejected'], 
    default: 'Awaiting Faculty' 
  }, // Multi-tier workflow
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  assetsRequested: [{ type: String }], // e.g. ["2 Mics", "1 Projector"]
  budget: { type: Number },
  category: { 
    type: String, 
    enum: ['Workshop', 'Seminar', 'Hackathon', 'Sports', 'Cultural', 'Fest', 'Competition'],
    default: 'Workshop'
  },
  capacityLimit: { type: Number },
  registrationDeadline: { type: Date },
  eventStatus: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming'
  },
  posterUrl: { type: String }, // Cloudinary URL
  photoGallery: [{ type: String }], // Auto-collated photos for NAAC report
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
