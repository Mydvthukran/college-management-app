import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Image as ImageIcon, Send, Plus, Wand2, MessageSquare } from 'lucide-react';
import { api } from '../utils/api';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Announcement Form State
  const [newAnnouncement, setNewAnnouncement] = useState({ message: '', eventId: '', targetRole: 'All' });
  const [sending, setSending] = useState(false);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const [eventsRes, annRes] = await Promise.all([
        api.get('/events/my-events'),
        api.get('/announcements/my')
      ]);
      setEvents(eventsRes || []);
      setAnnouncements(annRes || []);
    } catch (error) {
      console.error("Error fetching organizer data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.message) return alert("Message is required");
    
    try {
      setSending(true);
      await api.post('/announcements', newAnnouncement);
      setNewAnnouncement({ message: '', eventId: '', targetRole: 'All' });
      fetchOrganizerData();
      alert("Broadcast sent successfully!");
    } catch (error) {
      alert("Error sending broadcast: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const tabs = [
    { id: 'events', label: 'My Events', icon: <Settings size={16} /> },
    { id: 'registrations', label: 'Registrations', icon: <Users size={16} /> },
    { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={16} /> },
    { id: 'announcements', label: 'Announcements', icon: <MessageSquare size={16} /> },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-primary">Loading organizer dashboard...</div>;
  }

  // Calculate overall stats
  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registrationCount || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
        <p className="text-gray-400">Create events, manage registrations, upload to gallery, and broadcast announcements.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Events', value: events.length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Settings size={18} /> },
          { label: 'Total Registrations', value: totalRegistrations, color: 'text-green-400', bg: 'bg-green-500/10', icon: <Users size={18} /> },
          { label: 'Gallery Photos', value: '0', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <ImageIcon size={18} /> }, // Placeholder
          { label: 'Broadcasts Sent', value: announcements.length, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <Send size={18} /> },
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
            {events.length === 0 ? (
              <p className="text-gray-500 italic p-4 glass-panel col-span-2">You haven't created any events yet.</p>
            ) : (
              events.map((event) => (
                <div key={event._id} className="glass-panel p-6 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">{event.category}</span>
                      <h3 className="text-xl font-bold mt-2">{event.title}</h3>
                      <p className="text-sm text-gray-400">Status: <span className={event.approvalChainStatus === 'Approved' ? 'text-green-400' : 'text-amber-400'}>{event.approvalChainStatus}</span></p>
                    </div>
                    <button className="text-gray-400 hover:text-white"><Settings size={20} /></button>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-surface p-3 rounded-lg flex-1">
                      <p className="text-xs text-gray-500">Registrations</p>
                      <p className="font-bold text-lg">{event.registrationCount || 0} / {event.capacityLimit || '∞'}</p>
                      {event.capacityLimit && (
                        <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{width: `${((event.registrationCount || 0) / event.capacityLimit) * 100}%`}}></div>
                        </div>
                      )}
                    </div>
                    <div className="bg-surface p-3 rounded-lg flex-1">
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-bold text-sm mt-1">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button className="w-full btn-secondary flex items-center justify-center gap-2">
                    <Wand2 size={16} className="text-purple-400" /> AI Generate Description
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.section>
      )}

      {/* Registrations and Gallery tabs remain mostly UI placeholders as real participant listing requires building a sub-component with specific event selection, but we will show a placeholder message for now to maintain the flow */}
      {activeTab === 'registrations' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Participants</h2>
            <button className="btn-secondary py-2 text-sm">Export Excel</button>
          </div>
          <div className="glass-panel p-12 text-center text-gray-400">
            Select an event to view its registered participants.
            (This feature can be expanded in the next iteration).
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
          <form onSubmit={handleSendAnnouncement} className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4">Send Broadcast</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Target Event (Optional)</label>
                <select 
                  className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                  value={newAnnouncement.eventId}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, eventId: e.target.value})}
                >
                  <option value="">All Events (General Broadcast)</option>
                  {events.map(e => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Target Audience</label>
                <select 
                  className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50"
                  value={newAnnouncement.targetRole}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, targetRole: e.target.value})}
                >
                  <option value="All">All Users</option>
                  <option value="Student">Students Only</option>
                  <option value="Teacher">Teachers Only</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Message</label>
                <textarea 
                  className="w-full bg-surface border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                  rows={4}
                  placeholder="Type your message here... This will be sent via Email, SMS, and Push Notification."
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 py-2 disabled:opacity-50">
                  <Send size={18} /> {sending ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </div>
          </form>

          <h3 className="text-lg font-bold">Sent Broadcasts</h3>
          {announcements.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No broadcasts sent yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((broadcast) => (
                <div key={broadcast._id} className="glass-panel p-4">
                  <p className="text-sm font-medium">{broadcast.message}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{new Date(broadcast.createdAt).toLocaleDateString()}</span>
                    <span>Event: {broadcast.eventId?.title || 'General'}</span>
                    <span>Target: {broadcast.targetRole}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      )}
    </div>
  );
};

export default OrganizerDashboard;
