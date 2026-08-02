const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-management';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully to seed database');

    // Clear existing users to prevent duplicates if run multiple times
    await User.deleteMany({});
    console.log('Cleared existing users');

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Student User',
        email: 'student@nexus.edu',
        password: passwordHash,
        role: 'Student',
        branch: 'CSE',
        interests: ['Coding', 'Hackathons'],
        qrData: 'NXC-STUDENT'
      },
      {
        name: 'Organizer User',
        email: 'organizer@nexus.edu',
        password: passwordHash,
        role: 'Organizer',
        qrData: 'NXC-ORGANIZER'
      },
      {
        name: 'Teacher User',
        email: 'teacher@nexus.edu',
        password: passwordHash,
        role: 'Teacher',
        branch: 'CSE',
        qrData: 'NXC-TEACHER'
      },
      {
        name: 'Admin User',
        email: 'admin@nexus.edu',
        password: passwordHash,
        role: 'Admin',
        qrData: 'NXC-ADMIN'
      }
    ];

    await User.insertMany(users);
    console.log('Successfully seeded database with real users!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
