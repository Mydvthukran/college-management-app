import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, Map, Users, MessageSquare, BarChart, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('duty-leave');

  const [dutyLeaves, setDutyLeaves] = useState([]);
  const [venues, setVenues] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [dlRes, venuesRes, attRes, eventsRes] = await Promise.all([
        api.get('/teacher/duty-leaves/pending'),
        api.get('/venues'),
        api.get('/teacher/attendance'),
        api.get('/events?eventStatus=Completed')
      ]);
      setDutyLeaves(dlRes || []);
      setVenues(venuesRes || []);
      setAttendance(attRes || []);
      setCompletedEvents(eventsRes || []);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const handleDLStatus = async (id, status) => {
    try {
      await api.put(`/teacher/duty-leaves/${id}/status`, { status });
      fetchTeacherData(); // Refresh list
    } catch (error) {
      alert("Error updating Duty Leave: " + error.message);
    }
  };

  const tabs = [
    { id: 'duty-leave', label: 'Duty Leave', icon: <CheckCircle size={16} /> },
    { id: 'venues', label: 'Venue Booking', icon: <Map size={16} /> },
    { id: 'attendance', label: 'Attendance', icon: <Users size={16} /> },
    { id: 'reports', label: 'NAAC Reports', icon: <FileText size={16} /> },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-primary">Loading faculty portal...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Faculty Portal</h1>
        <p className="text-gray-400">Manage approvals, venues, attendance tracking, and reports.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending DL', value: dutyLeaves.length, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Clock size={18} /> },
          { label: 'Total Students', value: attendance.length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Users size={18} /> },
          { label: 'Venues', value: venues.length, color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Map size={18} /> },
          { label: 'Completed Events', value: completedEvents.length, color: 'text-green-400', bg: 'bg-green-500/10', icon: <CheckCircle size={18} /> },
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
            {dutyLeaves.length > 0 && (
              <button className="btn-primary flex items-center gap-2 py-2 text-sm">
                <CheckCircle size={16} /> Batch Approve All
              </button>
            )}
          </div>
          {dutyLeaves.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No pending duty leave requests.</p>
          ) : (
            dutyLeaves.map((dl) => (
              <div key={dl._id} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <p className="font-bold">{dl.studentId?.name} <span className="text-xs font-mono text-gray-400">({dl.studentId?.qrData})</span></p>
                  <p className="text-sm text-gray-400">Event: {dl.eventId?.title} • {new Date(dl.eventId?.date).toLocaleDateString()}</p>
                  {dl.checkedIn ? (
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1"><CheckCircle size={12} /> QR Verified — Checked In</p>
                  ) : (
                    <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><Clock size={12} /> Not yet checked in</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDLStatus(dl._id, 'Approved')} className="text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm border border-green-500/30 font-medium transition-colors flex items-center gap-1"><CheckCircle size={14}/> Approve</button>
                  <button onClick={() => handleDLStatus(dl._id, 'Rejected')} className="text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm border border-red-500/30 font-medium transition-colors flex items-center gap-1"><X size={14}/> Reject</button>
                </div>
              </div>
            ))
          )}
        </motion.section>
      )}

      {activeTab === 'venues' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Map size={20} /> Venue Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {venues.map((venue) => (
              <div key={venue._id} className="glass-panel p-6">
                <h3 className="font-bold text-lg mb-2">{venue.name}</h3>
                <p className="text-sm text-gray-400 mb-4">Capacity: {venue.capacity} seats</p>
                <div className="flex flex-wrap gap-2">
                  {venue.assetsAvailable.map((asset, i) => (
                    <span key={i} className="text-xs bg-surface border border-white/10 px-2 py-1 rounded">{asset}</span>
                  ))}
                </div>
              </div>
            ))}
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
                {attendance.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold">{s.name}</td>
                    <td className="p-3 text-gray-300 text-sm font-mono">{s.roll}</td>
                    <td className="p-3 text-gray-300 text-sm">{s.attended}</td>
                    <td className="p-3 text-gray-300 text-sm">{s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : 'Never'}</td>
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
          {completedEvents.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No completed events to generate reports for.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedEvents.map((report) => (
                <div key={report._id} className="glass-panel p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="font-bold">{report.title}</h3>
                    <p className="text-sm text-gray-400">Date: {new Date(report.date).toLocaleDateString()} • {report.category}</p>
                  </div>
                  <a 
                    href={`http://localhost:5000/api/teacher/export-report/${report._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <FileText size={18} /> Export PDF
                  </a>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
};

export default TeacherDashboard;
