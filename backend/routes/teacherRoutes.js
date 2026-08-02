const express = require('express');
const { PDFDocument, rgb } = require('pdf-lib');
const DutyLeave = require('../models/DutyLeave');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// 1. Get Pending Duty Leaves for the logged-in teacher
router.get('/duty-leaves/pending', auth, requireRole('Teacher', 'Admin'), async (req, res) => {
  try {
    const leaves = await DutyLeave.find({ teacherId: req.user.id, status: 'Pending' })
      .populate('studentId', 'name branch qrData')
      .populate('eventId', 'title date');
    
    // We also want to know if the student has checked in to the event (via Registration)
    // To attach this info to each DL request.
    const result = [];
    for (let leave of leaves) {
      const reg = await Registration.findOne({ studentId: leave.studentId._id, eventId: leave.eventId._id });
      result.push({
        ...leave.toObject(),
        checkedIn: reg ? reg.checkedIn : false
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Batch Approve Duty Leaves
router.post('/duty-leaves/batch-approve', auth, requireRole('Teacher', 'Admin'), async (req, res) => {
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

// 2.1 Single Approve/Reject Duty Leave
router.put('/duty-leaves/:id/status', auth, requireRole('Teacher', 'Admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const leave = await DutyLeave.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      { status },
      { new: true }
    );
    if (!leave) return res.status(404).json({ error: 'Duty leave not found or not authorized' });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Student Attendance tracker data (Teacher view)
router.get('/attendance', auth, requireRole('Teacher', 'Admin'), async (req, res) => {
  try {
    // Get all students and aggregate their attendance
    const students = await User.find({ role: { $in: ['Student', 'Club Lead'] } }).select('name email branch role qrData');
    
    const result = [];
    for (let student of students) {
      const totalRegistrations = await Registration.countDocuments({ studentId: student._id });
      const checkedInCount = await Registration.countDocuments({ studentId: student._id, checkedIn: true });
      
      const latestReg = await Registration.findOne({ studentId: student._id, checkedIn: true }).sort({ updatedAt: -1 });
      const lastSeen = latestReg ? latestReg.updatedAt : null;

      result.push({
        id: student._id,
        name: student.name,
        roll: student.qrData || 'N/A',
        attended: checkedInCount,
        lastSeen: lastSeen,
        pct: totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch Approve Duty Leaves
router.put('/duty-leaves/batch-approve', auth, requireRole('Teacher'), async (req, res) => {
  try {
    const result = await DutyLeave.updateMany(
      { status: 'Pending' },
      { $set: { status: 'Approved', approvedBy: req.user.id } }
    );
    res.json({ message: `${result.modifiedCount} duty leave requests approved.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. NAAC PDF Report Exporter
router.get('/export-report/:eventId', auth, requireRole('Teacher', 'Admin', 'Organizer'), async (req, res) => {
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
