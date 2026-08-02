import React, { useState } from 'react';
import { FileText, CheckCircle, Clock, Map, Users, MessageSquare, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('duty-leave');

  const tabs = [
    { id: 'duty-leave', label: 'Duty Leave', icon: <CheckCircle size={16} /> },
    { id: 'venues', label: 'Venue Booking', icon: <Map size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Users size={16} /> },
    { id: 'reports', label: 'NAAC Reports', icon: <FileText size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Faculty Portal</h1>
        <p className="text-gray-400">Manage approvals, venues, attendance tracking, and reports.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending DL', value: '5', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Clock size={18} /> },
          { label: 'Approved Today', value: '12', color: 'text-green-400', bg: 'bg-green-500/10', icon: <CheckCircle size={18} /> },
          { label: 'Total Students', value: '320', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Users size={18} /> },
          { label: 'Venues Booked', value: '3', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Map size={18} /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-5">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'duty-leave' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pending Duty Leave Requests</h2>
            <button className="btn-primary flex items-center gap-2 py-2 text-sm">
              <CheckCircle size={16} /> Batch Approve All
            </button>
          </div>
          {[
            { name: 'Rahul Sharma', id: 'CSE-2024-101', event: 'Tech Symposium 2026', date: 'Oct 15', checkedIn: true },
            { name: 'Priya Patel', id: 'CSE-2024-045', event: 'AI/ML Bootcamp', date: 'Oct 16', checkedIn: true },
            { name: 'Arjun Kumar', id: 'ECE-2024-032', event: 'Robotics Competition', date: 'Oct 17', checkedIn: false },
            { name: 'Sneha Gupta', id: 'CSE-2024-088', event: 'Web Dev Workshop', date: 'Oct 18', checkedIn: true },
            { name: 'Vikram Singh', id: 'ME-2024-012', event: 'Cultural Night', date: 'Oct 20', checkedIn: false },
          ].map((student, i) => (
            <div key={i} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold">{student.name} <span className="text-xs font-mono text-gray-400">({student.id})</span></p>
                <p className="text-sm text-gray-400">Event: {student.event} • {student.date}</p>
                {student.checkedIn ? (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={12} /> QR Verified — Checked In</p>
                ) : (
                  <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><Clock size={12} /> Not yet checked in</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm border border-green-500/30 font-medium transition-colors">Approve</button>
                <button className="text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm border border-red-500/30 font-medium transition-colors">Reject</button>
              </div>
            </div>
          ))}
        </motion.section>
      )}

      {activeTab === 'venues' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Map size={20} /> Venue Availability Grid</h2>
          <div className="glass-panel p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="p-3">Venue</th>
                  <th className="p-3">9:00 AM</th>
                  <th className="p-3">11:00 AM</th>
                  <th className="p-3">2:00 PM</th>
                  <th className="p-3">4:00 PM</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Main Auditorium', slots: ['Booked (Tech Fest)', 'Available', 'Booked (Robotics)', 'Available'] },
                  { name: 'Seminar Hall A', slots: ['Available', 'Available', 'Pending', 'Booked (Workshop)'] },
                  { name: 'Seminar Hall B', slots: ['Booked (AI Seminar)', 'Available', 'Available', 'Available'] },
                  { name: 'CS Lab Complex', slots: ['Available', 'Booked (Coding)', 'Available', 'Booked (Hackathon)'] },
                ].map((venue, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 font-semibold">{venue.name}</td>
                    {venue.slots.map((slot, j) => {
                      const isBooked = slot.startsWith('Booked');
                      const isPending = slot === 'Pending';
                      return (
                        <td key={j} className="p-3">
                          <div className={`px-2 py-1 rounded text-xs text-center border ${
                            isBooked ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            isPending ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            'bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer hover:bg-green-500/30'
                          }`}>{slot}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {activeTab === 'attendance' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold">Student Attendance Tracker</h2>
          <div className="glass-panel p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-3">Student</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Events Attended</th>
                  <th className="p-3">Last Seen</th>
                  <th className="p-3">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Rahul Sharma', roll: 'CSE-101', attended: 12, lastSeen: 'Today', pct: 92 },
                  { name: 'Priya Patel', roll: 'CSE-045', attended: 10, lastSeen: 'Yesterday', pct: 87 },
                  { name: 'Arjun Kumar', roll: 'ECE-032', attended: 8, lastSeen: '3 days ago', pct: 72 },
                  { name: 'Sneha Gupta', roll: 'CSE-088', attended: 14, lastSeen: 'Today', pct: 96 },
                  { name: 'Vikram Singh', roll: 'ME-012', attended: 6, lastSeen: '5 days ago', pct: 55 },
                  { name: 'Ananya Reddy', roll: 'CSE-067', attended: 11, lastSeen: 'Today', pct: 89 },
                ].map((s, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold">{s.name}</td>
                    <td className="p-3 text-gray-300 text-sm font-mono">{s.roll}</td>
                    <td className="p-3 text-gray-300 text-sm">{s.attended}</td>
                    <td className="p-3 text-gray-300 text-sm">{s.lastSeen}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.pct >= 75 ? 'bg-green-500' : s.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{width: `${s.pct}%`}}></div>
                        </div>
                        <span className={`text-xs font-bold ${s.pct >= 75 ? 'text-green-400' : s.pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{s.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {activeTab === 'reports' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold">Export NAAC Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Web Dev Workshop', date: '12th Oct', attendees: 145, hours: 4 },
              { title: 'Robotics Seminar', date: '15th Oct', attendees: 89, hours: 3 },
              { title: 'AI/ML Bootcamp', date: '18th Oct', attendees: 210, hours: 8 },
              { title: 'Cultural Night', date: '20th Oct', attendees: 320, hours: 5 },
            ].map((report, i) => (
              <div key={i} className="glass-panel p-6 flex flex-col gap-4">
                <div>
                  <h3 className="font-bold">{report.title}</h3>
                  <p className="text-sm text-gray-400">Date: {report.date} • Attendees: {report.attendees} • Duration: {report.hours}h</p>
                </div>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                  <FileText size={18} /> Export PDF
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default TeacherDashboard;
