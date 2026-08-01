import React, { useState } from 'react';
import { FileText, CheckCircle, Clock, Search, Map } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('duty-leave');

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Faculty Portal</h1>
        <p className="text-gray-400">Manage approvals, venues, and reports.</p>
      </header>

      <div className="flex gap-4 border-b border-white/10 pb-4 mb-6">
        <button 
          onClick={() => setActiveTab('duty-leave')}
          className={`font-semibold ${activeTab === 'duty-leave' ? 'text-primary' : 'text-gray-400'}`}
        >
          Duty Leave Requests
        </button>
        <button 
          onClick={() => setActiveTab('venues')}
          className={`font-semibold ${activeTab === 'venues' ? 'text-primary' : 'text-gray-400'}`}
        >
          Venue Booking
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`font-semibold ${activeTab === 'reports' ? 'text-primary' : 'text-gray-400'}`}
        >
          NAAC Reports
        </button>
      </div>

      {activeTab === 'duty-leave' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pending Duty Leaves (DL)</h2>
            <button className="btn-primary flex items-center gap-2 py-2">
              <CheckCircle size={18} /> Batch Approve All
            </button>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">Student {i} - 123456</p>
                <p className="text-sm text-gray-400">Event: Tech Symposium 2026</p>
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> QR Checked-in
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm border border-green-500/30">Approve</button>
                <button className="text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm border border-red-500/30">Reject</button>
              </div>
            </div>
          ))}
        </motion.section>
      )}

      {activeTab === 'venues' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Map size={20} /> Venue Grid</h2>
          <div className="glass-panel p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="p-3">Venue</th>
                  <th className="p-3">9:00 AM</th>
                  <th className="p-3">11:00 AM</th>
                  <th className="p-3">2:00 PM</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-3 font-semibold">Main Auditorium</td>
                  <td className="p-3"><div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs text-center border border-red-500/30">Booked (Tech Fest)</div></td>
                  <td className="p-3"><div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs text-center border border-green-500/30">Available</div></td>
                  <td className="p-3"><div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs text-center border border-red-500/30">Booked (Robotics)</div></td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Seminar Hall A</td>
                  <td className="p-3"><div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs text-center border border-green-500/30">Available</div></td>
                  <td className="p-3"><div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs text-center border border-green-500/30">Available</div></td>
                  <td className="p-3"><div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs text-center border border-orange-500/30">Pending Approval</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {activeTab === 'reports' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-xl font-bold mb-4">Export NAAC Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 flex flex-col items-start gap-4">
              <div>
                <h3 className="font-bold">Web Dev Workshop</h3>
                <p className="text-sm text-gray-400">Date: 12th Oct | Attendees: 145</p>
              </div>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <FileText size={18} /> Export PDF
              </button>
            </div>
            <div className="glass-panel p-6 flex flex-col items-start gap-4">
              <div>
                <h3 className="font-bold">Robotics Seminar</h3>
                <p className="text-sm text-gray-400">Date: 15th Oct | Attendees: 89</p>
              </div>
              <button className="btn-secondary w-full flex items-center justify-center gap-2">
                <FileText size={18} /> Export PDF
              </button>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default TeacherDashboard;
