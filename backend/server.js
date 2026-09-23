const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;

mongoose.set('bufferCommands', false);

let databaseMode = 'disconnected';

const connectDatabase = async () => {
  if (!MONGO_URI) {
    console.error('MONGO_URI is missing. Starting without database.');
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    });

    databaseMode = 'mongodb';
    console.log('MongoDB connected successfully.');
  } catch (error) {
    databaseMode = 'disconnected';
    console.error('MongoDB connection failed:', error.message);
    console.warn('API will remain available. Test admin login can be used for UI recovery.');
  }
};

mongoose.connection.on('error', (error) => {
  databaseMode = 'disconnected';
  console.error('MongoDB error:', error.message);
});

mongoose.connection.on('connected', () => {
  databaseMode = 'mongodb';
});

mongoose.connection.on('disconnected', () => {
  databaseMode = 'disconnected';
  console.error('MongoDB disconnected.');
});

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const venueRoutes = require('./routes/venueRoutes');
const judgingRoutes = require('./routes/judgingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const settingRoutes = require('./routes/settingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/judging', judgingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/settings', settingRoutes);

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'database_unavailable',
    database: connected ? 'mongodb' : 'disconnected',
    testAdminAvailable: !connected,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDatabase();
});

const shutdown = async () => {
  try {
    await mongoose.connection.close();
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
