const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Create Event (Organizer or Club Lead)
router.post('/', auth, requireRole('Organizer', 'Club Lead', 'Admin'), async (req, res) => {
  try {
    const newEvent = new Event({ ...req.body, clubId: req.user.id });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.approvalChainStatus = req.query.status;
    if (req.query.eventStatus) filter.eventStatus = req.query.eventStatus;
    if (req.query.category) filter.category = req.query.category;

    const events = await Event.find(filter)
      .populate('clubId', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming events (today + next 7 days)
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const events = await Event.find({
      date: { $gte: today, $lte: nextWeek },
      approvalChainStatus: 'Approved',
    })
      .populate('clubId', 'name')
      .sort({ date: 1 });

    // Split into today and rest of week
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const todayEvents = events.filter(e => e.date <= endOfToday);
    const weekEvents = events.filter(e => e.date > endOfToday);

    // Get registration counts for each event
    const eventIds = events.map(e => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    regCounts.forEach(r => { countMap[r._id.toString()] = r.count; });

    const addCounts = (list) => list.map(e => ({
      ...e.toObject(),
      registrationCount: countMap[e._id.toString()] || 0,
    }));

    res.json({
      today: addCounts(todayEvents),
      week: addCounts(weekEvents),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organizer's own events with registration counts
router.get('/my-events', auth, requireRole('Organizer', 'Club Lead', 'Admin'), async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.user.id }).sort({ date: -1 });

    const eventIds = events.map(e => e._id);
    const regCounts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      { $group: { _id: '$eventId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    regCounts.forEach(r => { countMap[r._id.toString()] = r.count; });

    const result = events.map(e => ({
      ...e.toObject(),
      registrationCount: countMap[e._id.toString()] || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('clubId', 'name');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get registrations for an event
router.get('/:id/registrations', auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.id })
      .populate('studentId', 'name email branch')
      .populate('teamMembers', 'name email branch');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject Event (Admin)
router.put('/:id/approve', auth, requireRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { approvalChainStatus: status || 'Approved' },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register for an event (Student) with Clash Check and Team Support
router.post('/:id/register', auth, async (req, res) => {
  try {
    const { teamName, teamMembers } = req.body; // teamMembers is an array of emails
    
    const targetEvent = await Event.findById(req.params.id);
    if (!targetEvent) return res.status(404).json({ error: 'Event not found' });

    // Check capacity
    if (targetEvent.capacityLimit) {
      const currentCount = await Registration.countDocuments({ eventId: req.params.id });
      if (currentCount >= targetEvent.capacityLimit) {
        return res.status(400).json({ error: 'Event is full.' });
      }
    }

    // Team Logic
    let memberIds = [];
    if (targetEvent.isTeamEvent) {
      if (!teamName) return res.status(400).json({ error: 'Team name is required for team events.' });
      
      let emails = [];
      if (teamMembers && Array.isArray(teamMembers)) {
        emails = teamMembers.map(email => email.trim().toLowerCase()).filter(e => e);
      }
      
      if (emails.length > targetEvent.maxTeamSize - 1) { // -1 because the registering student is a member
        return res.status(400).json({ error: `Maximum team size is ${targetEvent.maxTeamSize} (including you).` });
      }

      if (emails.length > 0) {
        // Find users by email
        const users = await User.find({ email: { $in: emails } });
        if (users.length !== emails.length) {
          return res.status(400).json({ error: 'One or more team member emails do not belong to a registered user.' });
        }
        memberIds = users.map(u => u._id);
      }
    }

    // Clash logic check for the registering student
    const existingRegistrations = await Registration.find({ studentId: req.user.id }).populate('eventId');
    const hasClash = existingRegistrations.some(reg => {
      const e = reg.eventId;
      if (!e) return false;
      return e.date.toISOString() === targetEvent.date.toISOString() &&
             ((targetEvent.startTime >= e.startTime && targetEvent.startTime < e.endTime) ||
              (targetEvent.endTime > e.startTime && targetEvent.endTime <= e.endTime));
    });

    if (hasClash) return res.status(400).json({ error: 'Timetable clash detected with another registered event.' });

    const newReg = new Registration({ 
      studentId: req.user.id, 
      eventId: req.params.id,
      teamName: targetEvent.isTeamEvent ? teamName : undefined,
      teamMembers: targetEvent.isTeamEvent ? memberIds : undefined
    });
    
    await newReg.save();
    res.status(201).json({ message: 'Registered successfully', registration: newReg });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already registered for this event.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Cancel registration
router.delete('/:id/register', auth, async (req, res) => {
  try {
    await Registration.findOneAndDelete({ studentId: req.user.id, eventId: req.params.id });
    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// QR Code Check-In (Organizer/Teacher/Admin)
router.post('/:id/check-in', auth, requireRole('Organizer', 'Teacher', 'Admin', 'Club Lead'), async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

    // Check if registration exists
    const reg = await Registration.findOne({ eventId: req.params.id, studentId });
    if (!reg) {
      return res.status(404).json({ error: 'Student is not registered for this event' });
    }

    if (reg.checkedIn) {
      return res.status(400).json({ error: 'Student has already checked in' });
    }

    reg.checkedIn = true;
    await reg.save();

    // Populate student info for the response
    const populatedReg = await Registration.findById(reg._id).populate('studentId', 'name branch qrData');

    res.json({ message: 'Check-in successful', registration: populatedReg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

// Approve/Reject Event (Admin)
router.put('/:id/approve', auth, requireRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { approvalChainStatus: status },
      { new: true }
    );
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Certificate
router.get('/:id/certificate', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.certificateGenerated) return res.status(400).json({ error: 'Certificates not yet available' });

    // In a real app we would check if the user actually attended (checkedIn == true).
    // For the sake of the demo, we allow them to download it if it's generated.
    const reg = await Registration.findOne({ eventId: event._id, studentId: req.user.id });
    if (!reg) return res.status(403).json({ error: 'You are not registered for this event.' });
    if (!reg.checkedIn) return res.status(403).json({ error: 'You did not check in to this event.' });

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw Border
    page.drawRectangle({
      x: 20, y: 20, width: width - 40, height: height - 40,
      borderColor: rgb(0.2, 0.4, 0.8),
      borderWidth: 5,
    });

    page.drawText('Certificate of Participation', {
      x: width / 2 - 250, y: height - 120,
      size: 40, font: font, color: rgb(0.1, 0.1, 0.4),
    });

    page.drawText('This is to certify that', {
      x: width / 2 - 120, y: height - 200,
      size: 20, font: regularFont,
    });

    page.drawText(req.user.name.toUpperCase(), {
      x: width / 2 - 180, y: height - 260,
      size: 35, font: font, color: rgb(0.8, 0.2, 0.2),
    });

    page.drawText(`has successfully participated in ${event.title}`, {
      x: width / 2 - 200, y: height - 340,
      size: 20, font: regularFont,
    });

    page.drawText(`held on ${new Date(event.date).toLocaleDateString()}`, {
      x: width / 2 - 100, y: height - 400,
      size: 18, font: regularFont,
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${event.title.replace(/\s+/g, '_')}.pdf`);
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
