const express = require('express');
const { PDFDocument, rgb } = require('pdf-lib');
const DutyLeave = require('../models/DutyLeave');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const router = express.Router();

// Mock middleware
const authTeacher = (req, res, next) => {
  // In a real app, verify JWT and check if role is 'Admin' or 'Teacher'
  req.user = { id: 'mockTeacherId123', role: 'Teacher' };
  next();
};

// 1. Get Pending Duty Leaves
router.get('/duty-leaves/pending', authTeacher, async (req, res) => {
  try {
    const leaves = await DutyLeave.find({ teacherId: req.user.id, status: 'Pending' })
      .populate('studentId', 'name branch')
      .populate('eventId', 'title date');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Batch Approve Duty Leaves
router.post('/duty-leaves/batch-approve', authTeacher, async (req, res) => {
  try {
    const { leaveIds } = req.body; // array of IDs
    await DutyLeave.updateMany(
      { _id: { $in: leaveIds }, teacherId: req.user.id },
      { $set: { status: 'Approved' } }
    );
    res.json({ message: 'Duty Leaves approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. NAAC PDF Report Exporter
router.get('/export-report/:eventId', authTeacher, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const registrations = await Registration.find({ eventId: event._id, checkedIn: true });

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    
    page.drawText(`Official NAAC Event Report`, { x: 50, y: 750, size: 24, color: rgb(0, 0.3, 0.8) });
    page.drawText(`Event Title: ${event.title}`, { x: 50, y: 700, size: 14 });
    page.drawText(`Date & Time: ${event.date.toDateString()} | ${event.startTime} - ${event.endTime}`, { x: 50, y: 680, size: 12 });
    page.drawText(`Venue: ${event.venue}`, { x: 50, y: 660, size: 12 });
    
    page.drawText(`Attendance Summary:`, { x: 50, y: 620, size: 16 });
    page.drawText(`Total Verified Attendees: ${registrations.length}`, { x: 50, y: 590, size: 12 });
    
    page.drawText(`AI Feedback Summary:`, { x: 50, y: 550, size: 16 });
    page.drawText(`"Students appreciated the practical sessions. Overall positive sentiment: 88%"`, { x: 50, y: 520, size: 12 });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=NAAC_Report_${event._id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
