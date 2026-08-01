const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Main Auditorium"
  capacity: { type: Number, required: true },
  assetsAvailable: [{ type: String }], // e.g. ["Projector", "Mics", "Whiteboard"]
});

module.exports = mongoose.model('Venue', venueSchema);
