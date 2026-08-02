const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-management';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const venueRoutes = require('./routes/venueRoutes');
const judgingRoutes = require('./routes/judgingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/judging', judgingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running smooth!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
