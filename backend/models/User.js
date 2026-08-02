const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Student', 'Club Lead', 'Admin', 'Organizer', 'Teacher'], 
    default: 'Student' 
  },
  branch: { type: String }, // e.g., 'CSE', 'AI/ML'
  interests: [{ type: String }], // Tags for AI recommendation
  qrData: { type: String }, // Dynamic QR payload
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
