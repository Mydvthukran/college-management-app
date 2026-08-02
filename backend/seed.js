const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Venue = require('./models/Venue');
const Registration = require('./models/Registration');
const DutyLeave = require('./models/DutyLeave');
const Announcement = require('./models/Announcement');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college-management';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding.');

    // Clear all existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Venue.deleteMany();
    await Registration.deleteMany();
    await DutyLeave.deleteMany();
    await Announcement.deleteMany();
    console.log('Cleared existing data.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Users
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@siet.edu', password: hashedPassword, role: 'Admin' },
      { name: 'Student User', email: 'student@siet.edu', password: hashedPassword, role: 'Student', branch: 'CSE', qrData: 'SIET-1001', interests: ['robotics', 'web dev', 'hackathon'] },
      { name: 'Teacher User', email: 'teacher@siet.edu', password: hashedPassword, role: 'Teacher', branch: 'CSE' },
      { name: 'Organizer User', email: 'organizer@siet.edu', password: hashedPassword, role: 'Organizer' },
      { name: 'Club Lead User', email: 'clublead@siet.edu', password: hashedPassword, role: 'Club Lead', branch: 'CSE' },
      { name: 'Sneha Gupta', email: 'sneha@siet.edu', password: hashedPassword, role: 'Student', branch: 'CSE', qrData: 'SIET-1002' },
      { name: 'Rahul Sharma', email: 'rahul@siet.edu', password: hashedPassword, role: 'Student', branch: 'ECE', qrData: 'SIET-1003' },
    ]);

    const admin = users[0];
    const student = users[1];
    const teacher = users[2];
    const organizer = users[3];
    const clubLead = users[4];
    const student2 = users[5];
    const student3 = users[6];
    console.log('Users seeded.');

    // 2. Seed Venues
    const venues = await Venue.insertMany([
      { name: 'Main Auditorium', capacity: 500, assetsAvailable: ['Projector', 'Mics', 'Sound System'] },
      { name: 'Seminar Hall A', capacity: 150, assetsAvailable: ['Projector', 'Whiteboard'] },
      { name: 'Seminar Hall B', capacity: 150, assetsAvailable: ['Projector', 'Whiteboard'] },
      { name: 'CS Lab Complex', capacity: 80, assetsAvailable: ['Computers', 'Internet'] },
      { name: 'Open Air Theatre', capacity: 1000, assetsAvailable: ['Stage', 'Sound System'] },
    ]);
    console.log('Venues seeded.');

    // 3. Seed Events
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 3);

    const events = await Event.insertMany([
      {
        title: 'Advanced Web Dev Workshop',
        description: 'Learn React, Node.js and full-stack development.',
        clubId: clubLead._id,
        date: today,
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Main Auditorium',
        venueId: venues[0]._id,
        tags: ['web dev', 'workshop', 'react'],
        approvalChainStatus: 'Approved',
        category: 'Workshop',
        capacityLimit: 200,
        eventStatus: 'Upcoming'
      },
      {
        title: 'AI/ML Bootcamp Day 2',
        description: 'Hands-on session with TensorFlow and PyTorch.',
        clubId: organizer._id,
        date: today,
        startTime: '14:00',
        endTime: '16:00',
        venue: 'Seminar Hall A',
        venueId: venues[1]._id,
        tags: ['ai', 'ml', 'bootcamp'],
        approvalChainStatus: 'Approved',
        category: 'Workshop',
        capacityLimit: 100,
        eventStatus: 'Upcoming'
      },
      {
        title: 'HackTheCampus 2026',
        description: '48-hour hackathon to solve campus problems.',
        clubId: clubLead._id,
        date: tomorrow,
        startTime: '09:00',
        endTime: '18:00',
        venue: 'CS Lab Complex',
        venueId: venues[3]._id,
        tags: ['hackathon', 'coding', 'competition'],
        approvalChainStatus: 'Approved',
        category: 'Hackathon',
        capacityLimit: 300,
        eventStatus: 'Upcoming'
      },
      {
        title: 'Robotics Club Weekly Meet',
        description: 'Discussing IoT and Arduino projects.',
        clubId: clubLead._id,
        date: nextWeek,
        startTime: '16:00',
        endTime: '17:30',
        venue: 'Seminar Hall B',
        venueId: venues[2]._id,
        tags: ['robotics', 'iot', 'hardware'],
        approvalChainStatus: 'Approved',
        category: 'Seminar',
        capacityLimit: 50,
        eventStatus: 'Upcoming'
      },
      {
        title: 'Past Design Sprint',
        description: 'UI/UX design competition.',
        clubId: organizer._id,
        date: pastDate,
        startTime: '10:00',
        endTime: '14:00',
        venue: 'CS Lab Complex',
        venueId: venues[3]._id,
        tags: ['design', 'ui', 'ux'],
        approvalChainStatus: 'Approved',
        category: 'Competition',
        capacityLimit: 100,
        eventStatus: 'Completed'
      },
      {
        title: 'Pending Cultural Fest',
        description: 'Annual cultural festival proposal.',
        clubId: organizer._id,
        date: nextWeek,
        startTime: '18:00',
        endTime: '22:00',
        venue: 'Open Air Theatre',
        venueId: venues[4]._id,
        tags: ['cultural', 'fest', 'music'],
        approvalChainStatus: 'Awaiting Faculty', // Pending approval
        category: 'Fest',
        capacityLimit: 1000,
        eventStatus: 'Upcoming'
      }
    ]);
    console.log('Events seeded.');

    // 4. Seed Registrations
    const registrations = await Registration.insertMany([
      { studentId: student._id, eventId: events[0]._id, checkedIn: false }, // Web Dev (Today)
      { studentId: student._id, eventId: events[2]._id, checkedIn: false }, // HackTheCampus (Tomorrow)
      { studentId: student._id, eventId: events[4]._id, checkedIn: true, certificateGenerated: true }, // Past Design Sprint
      
      { studentId: student2._id, eventId: events[0]._id, checkedIn: false },
      { studentId: student2._id, eventId: events[1]._id, checkedIn: false },
      
      { studentId: student3._id, eventId: events[4]._id, checkedIn: true, certificateGenerated: true },
    ]);
    console.log('Registrations seeded.');

    // 5. Seed Duty Leaves
    await DutyLeave.insertMany([
      { studentId: student._id, eventId: events[2]._id, teacherId: teacher._id, date: tomorrow, status: 'Pending' },
      { studentId: student2._id, eventId: events[0]._id, teacherId: teacher._id, date: today, status: 'Pending' },
      { studentId: student3._id, eventId: events[4]._id, teacherId: teacher._id, date: pastDate, status: 'Approved' },
    ]);
    console.log('Duty Leaves seeded.');

    // 6. Seed Announcements
    await Announcement.insertMany([
      { message: 'Registration for HackTheCampus closes soon. Hurry!', eventId: events[2]._id, createdBy: admin._id, targetRole: 'All' },
      { message: 'Venue changed to Seminar Hall B for the Web Dev Bootcamp.', createdBy: organizer._id, targetRole: 'Student' },
      { message: 'New club formed: AI/ML Research Society.', createdBy: admin._id, targetRole: 'All' },
    ]);
    console.log('Announcements seeded.');

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
