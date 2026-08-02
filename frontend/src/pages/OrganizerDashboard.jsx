import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Image as ImageIcon, Send, Plus, Wand2, BarChart, MessageSquare } from 'lucide-react';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  const tabs = [
    { id: 'events', label: 'My Events', icon: <Settings size={16} /> },
    { id: 'registrations', label: 'Registrations', icon: <Users size={16} /> },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={16} /> },
    { id: 'announcements', label: 'Announcements', icon: <MessageSquare size={16} /> },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
        <p className="text-gray-400">Create events, manage registrations, upload to gallery, and broadcast announcements.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Events', value: '4', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Settings size={18} /> },
          { label: 'Total Registrations', value: '456', color: 'text-green-400', bg: 'bg-green-500/10', icon: <Users size={18} /> },
          { label: 'Gallery Photos', value: '89', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <ImageIcon size={18} /> },
          { label: 'Broadcasts Sent', value: '12', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Send size={18} /> },
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

      {activeTab === 'events' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Events</h2>
            <button className="btn-primary flex items-center gap-2 py-2">
              <Plus size={18} /> Create Event
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'HackTheCampus 2026', category: 'Hackathon', status: 'Upcoming', registrations: 156, max: 200, deadline: 'Oct 12' },
              { title: 'Tech Symposium', category: 'Conference', status: 'Open', registrations: 89, max: 300, deadline: 'Oct 18' },
              { title: 'Web Dev Bootcamp', category: 'Workshop', status: 'Upcoming', registrations: 45, max: 50, deadline: 'Oct 10' },
              { title: 'Design Sprint', category: 'Competition', status: 'Draft', registrations: 0, max: 100, deadline: 'Oct 25' },
            ].map((event, i) => (
              <div key={i} className="glass-panel p-6 border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">{event.category}</span>
                    <h3 className="text-xl font-bold mt-2">{event.title}</h3>
                    <p className="text-sm text-gray-400">Status: <span className={event.status === 'Draft' ? 'text-gray-400' : 'text-green-400'}>{event.status}</span></p>
                  </div>
                  <button className="text-gray-400 hover:text-white"><Settings size={20} /></button>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="bg-surface p-3 rounded-lg flex-1">
                    <p className="text-xs text-gray-500">Registrations</p>
                    <p className="font-bold text-lg">{event.registrations} / {event.max}</p>
                    <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{width: `${(event.registrations / event.max) * 100}%`}}></div>
                    </div>
                  </div>
                  <div className="bg-surface p-3 rounded-lg flex-1">
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-bold text-sm mt-1">{event.deadline}</p>
                  </div>
                </div>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Wand2 size={16} className="text-purple-400" /> AI Generate Description
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {activeTab === 'registrations' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Participants</h2>
            <button className="btn-secondary py-2 text-sm">Export Excel</button>
          </div>
          <div className="glass-panel p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-3">Name</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Event</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Alice Cooper', branch: 'CSE', event: 'HackTheCampus', team: 'Alpha', status: 'Confirmed' },
                  { name: 'Bob Martin', branch: 'ECE', event: 'HackTheCampus', team: 'Beta', status: 'Confirmed' },
                  { name: 'Carol Davis', branch: 'CSE', event: 'Tech Symposium', team: '-', status: 'Waitlisted' },
                  { name: 'David Lee', branch: 'ME', event: 'Web Dev Bootcamp', team: '-', status: 'Confirmed' },
                  { name: 'Eve Wilson', branch: 'CSE', event: 'Design Sprint', team: 'Gamma', status: 'Pending' },
                ].map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3 text-gray-300">{p.branch}</td>
                    <td className="p-3 text-gray-300 text-sm">{p.event}</td>
                    <td className="p-3 text-gray-300">{p.team}</td>
                    <td className="p-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${
                        p.status === 'Confirmed' ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                        p.status === 'Waitlisted' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                        'text-gray-400 bg-surface border-white/10'
                      }`}>{p.status}</span>
                    </td>
                    <td className="p-3">
                      <button className="text-red-400 hover:text-red-300 text-sm font-medium">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {activeTab === 'gallery' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/20">
            <ImageIcon size={48} className="text-gray-500 mb-4" />
            <h3 className="text-lg font-bold">Upload to Event Gallery</h3>
            <p className="text-gray-400 text-sm mb-6">Drag and drop photos/videos (Cloudinary sync)</p>
            <button className="btn-primary">Select Files</button>
          </div>

          <h3 className="text-lg font-bold">Recent Uploads</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="glass-panel aspect-square flex items-center justify-center text-gray-600 hover:border-primary/30 transition-colors cursor-pointer">
                <ImageIcon size={32} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {activeTab === 'announcements' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4">Send Broadcast</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Target Event</label>
                <select className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                  <option>All Events</option>
                  <option>HackTheCampus 2026</option>
                  <option>Tech Symposium</option>
                  <option>Web Dev Bootcamp</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Message</label>
                <textarea 
                  className="w-full bg-surface border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                  rows={4}
                  placeholder="Type your message here... This will be sent via Email, SMS, and Push Notification."
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2 py-2">
                  <Send size={18} /> Send Now
                </button>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold">Sent Broadcasts</h3>
          <div className="space-y-3">
            {[
              { message: 'Reminder: HackTheCampus starts tomorrow at 9 AM!', time: '2 hours ago', event: 'HackTheCampus', reach: 156 },
              { message: 'Venue changed to Seminar Hall B for Web Dev Bootcamp', time: '1 day ago', event: 'Web Dev Bootcamp', reach: 45 },
              { message: 'Registration deadline extended to Oct 18', time: '3 days ago', event: 'Tech Symposium', reach: 300 },
            ].map((broadcast, i) => (
              <div key={i} className="glass-panel p-4">
                <p className="text-sm font-medium">{broadcast.message}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>{broadcast.time}</span>
                  <span>Event: {broadcast.event}</span>
                  <span>Reached: {broadcast.reach} users</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default OrganizerDashboard;
