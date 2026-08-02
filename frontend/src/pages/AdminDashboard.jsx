import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, BarChart, Users, Shield, Activity, Settings, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approvals');

  const tabs = [
    { id: 'approvals', label: 'Approvals', icon: <Shield size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart size={16} /> },
    { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <header className="mb-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500"
        >
          Admin Portal
        </motion.h1>
        <p className="text-gray-400">Full system control — approvals, analytics, users, and settings.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: '7', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <AlertTriangle size={18} /> },
          { label: 'Active Events', value: '14', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Activity size={18} /> },
          { label: 'Total Users', value: '1,246', color: 'text-green-400', bg: 'bg-green-500/10', icon: <Users size={18} /> },
          { label: 'System Health', value: '99.9%', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Shield size={18} /> },
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

      {activeTab === 'approvals' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-xl font-bold">Pending Event Approvals</h2>
          {[
            { title: 'Tech Symposium 2026', club: 'Coding Club', budget: '₹25,000', date: 'Oct 15', venue: 'Main Auditorium' },
            { title: 'Cultural Night', club: 'Cultural Society', budget: '₹40,000', date: 'Oct 20', venue: 'Open Air Theatre' },
            { title: 'Robotics Competition', club: 'Robotics Club', budget: '₹15,000', date: 'Oct 22', venue: 'CS Lab' },
          ].map((event, i) => (
            <div key={i} className="glass-panel p-6 border-l-4 border-l-amber-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-400">By: {event.club} • Budget: {event.budget}</p>
                  <p className="text-sm text-gray-400">Date: {event.date} • Venue: {event.venue}</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Check size={16} /> Approve
                  </button>
                  <button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.section>
      )}

      {activeTab === 'analytics' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><BarChart className="text-primary" /> Platform Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Attendance Chart */}
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Weekly Event Attendance</h3>
              <div className="h-48 flex items-end justify-between gap-3 pb-4 border-b border-white/10 relative">
                {[
                  { day: 'Mon', value: 40 }, { day: 'Tue', value: 70 }, { day: 'Wed', value: 45 },
                  { day: 'Thu', value: 90 }, { day: 'Fri', value: 65 }, { day: 'Sat', value: 30 },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${bar.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-md"
                    />
                    <span className="text-xs text-gray-500">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Categories */}
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Events by Category</h3>
              <div className="space-y-4">
                {[
                  { category: 'Technical', count: 45, percentage: 40, color: 'bg-blue-500' },
                  { category: 'Cultural', count: 28, percentage: 25, color: 'bg-purple-500' },
                  { category: 'Sports', count: 20, percentage: 18, color: 'bg-green-500' },
                  { category: 'Workshops', count: 19, percentage: 17, color: 'bg-amber-500' },
                ].map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat.category}</span>
                      <span className="text-gray-400">{cat.count} events</span>
                    </div>
                    <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className={`h-full ${cat.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {activeTab === 'users' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">All Users</h2>
            <button className="btn-primary py-2 text-sm">+ Add User</button>
          </div>
          <div className="glass-panel p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Student User', email: 'student@siet.edu', role: 'Student', branch: 'CSE', status: 'Active' },
                  { name: 'Organizer User', email: 'organizer@siet.edu', role: 'Organizer', branch: '-', status: 'Active' },
                  { name: 'Teacher User', email: 'teacher@siet.edu', role: 'Teacher', branch: 'CSE', status: 'Active' },
                  { name: 'Admin User', email: 'admin@siet.edu', role: 'Admin', branch: '-', status: 'Active' },
                ].map((u, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 text-gray-300 text-sm">{u.email}</td>
                    <td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{u.role}</span></td>
                    <td className="p-3 text-gray-300 text-sm">{u.branch}</td>
                    <td className="p-3"><span className="text-xs text-green-400">{u.status}</span></td>
                    <td className="p-3 flex gap-2">
                      <button className="text-xs text-primary hover:underline">Edit</button>
                      <button className="text-xs text-red-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {activeTab === 'settings' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold">System Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold">General</h3>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div><p className="text-sm font-medium">Allow New Registrations</p><p className="text-xs text-gray-500">Users can self-register</p></div>
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div></div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div><p className="text-sm font-medium">Auto-Approve Events</p><p className="text-xs text-gray-500">Skip manual approval</p></div>
                <div className="w-12 h-6 bg-surface border border-white/20 rounded-full relative cursor-pointer"><div className="absolute left-0.5 top-0.5 w-5 h-5 bg-gray-400 rounded-full"></div></div>
              </div>
              <div className="flex justify-between items-center py-2">
                <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-gray-500">Send email for all events</p></div>
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer"><div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full"></div></div>
              </div>
            </div>
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold">Database & Server</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm p-3 bg-surface/50 rounded-lg">
                  <span className="text-gray-400">MongoDB Status</span>
                  <span className="text-green-400 font-medium">Connected</span>
                </div>
                <div className="flex justify-between text-sm p-3 bg-surface/50 rounded-lg">
                  <span className="text-gray-400">API Status</span>
                  <span className="text-green-400 font-medium">Running</span>
                </div>
                <div className="flex justify-between text-sm p-3 bg-surface/50 rounded-lg">
                  <span className="text-gray-400">Total Collections</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between text-sm p-3 bg-surface/50 rounded-lg">
                  <span className="text-gray-400">Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default AdminDashboard;
