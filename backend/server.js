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

if (!MONGO_URI) {
  console.error('MONGO_URI is missing. Configure it in the deployment environment.');
}

mongoose.set('bufferCommands', false);

const connectDatabase = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not configured.');
  }

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 15000,
  });

  console.log('MongoDB connected successfully.');
};

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error.message);
});

mongoose.connection.on('disconnected', () => {
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
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

const shutdown = async () => {
  try {
    await mongoose.connection.close();
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
