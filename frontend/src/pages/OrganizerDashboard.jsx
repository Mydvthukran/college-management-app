import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Image as ImageIcon, Send, Plus, Wand2 } from 'lucide-react';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
        <p className="text-gray-400">Manage events, registrations, galleries, and AI insights.</p>
      </header>

      <div className="flex gap-4 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
        {['events', 'registrations', 'gallery', 'announcements'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'text-primary' : 'text-gray-400'}`}
          >
            {tab}
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
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel p-6 border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">Hackathon</span>
                    <h3 className="text-xl font-bold mt-2">HackTheCampus 2026</h3>
                    <p className="text-sm text-gray-400">Status: <span className="text-green-400">Upcoming</span></p>
                  </div>
                  <button className="text-gray-400 hover:text-white"><Settings size={20} /></button>
                </div>
                <div className="flex gap-4 mb-6">
                  <div className="bg-surface p-3 rounded-lg flex-1">
                    <p className="text-xs text-gray-500">Registrations</p>
                    <p className="font-bold text-lg">156 / 200</p>
                  </div>
                  <div className="bg-surface p-3 rounded-lg flex-1">
                    <p className="text-xs text-gray-500">Deadline</p>
                    <p className="font-bold text-sm mt-1">Oct 12</p>
                  </div>
                </div>
                <button className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Wand2 size={16} className="text-secondary" /> AI Generate Description
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
                  <th className="p-3">Team</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-3 font-semibold">Alice Cooper</td>
                  <td className="p-3 text-gray-300">CSE</td>
                  <td className="p-3 text-gray-300">Alpha</td>
                  <td className="p-3">
                    <button className="text-red-400 hover:text-red-300 text-sm">Revoke</button>
                  </td>
                </tr>
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
        </motion.section>
      )}

      {activeTab === 'announcements' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4">Send Broadcast</h2>
            <textarea 
              className="w-full bg-surface border border-white/10 rounded-lg p-4 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
              rows={4}
              placeholder="Type your message here... This will be sent via Email, SMS, and Push Notification to all registered participants."
            ></textarea>
            <div className="flex justify-end">
              <button className="btn-primary flex items-center gap-2 py-2">
                <Send size={18} /> Send Now
              </button>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default OrganizerDashboard;
