import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Image as ImageIcon, Send, Plus, Wand2, MessageSquare, Download, ScanLine } from 'lucide-react';
import { api } from '../utils/api';
import * as XLSX from 'xlsx';
import { Html5QrcodeScanner } from 'html5-qrcode';

const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', category: 'Workshop', date: '', startTime: '', endTime: '', venue: '', capacityLimit: ''
  });
  const [creating, setCreating] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  // New Announcement Form State
  const [newAnnouncement, setNewAnnouncement] = useState({ message: '', eventId: '', targetRole: 'All' });
  const [sending, setSending] = useState(false);

  // Participants & QR Scanner
  const [selectedEventId, setSelectedEventId] = useState('');
  const [participants, setParticipants] = useState([]);
  const [scanning, setScanning] = useState(false);

  const fetchOrganizerData = async () => {
    try {
      setLoading(true);
      const [eventsRes, annRes] = await Promise.all([
        api.get('/events/my-events'),
        api.get('/announcements/my')
      ]);
      setEvents(eventsRes || []);
      setAnnouncements(annRes || []);
      if (eventsRes?.length > 0 && !selectedEventId) {
        setSelectedEventId(eventsRes[0]._id);
      }
    } catch (error) {
      console.error("Error fetching organizer data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  // Fetch Participants when tab changes or selection changes
  useEffect(() => {
    if (activeTab === 'registrations' && selectedEventId) {
      fetchParticipants(selectedEventId);
    }
  }, [activeTab, selectedEventId]);

  const fetchParticipants = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/registrations`);
      setParticipants(res || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.post('/events', newEvent);
      alert('Event created and pending approval!');
      setNewEvent({ title: '', description: '', category: 'Workshop', date: '', startTime: '', endTime: '', venue: '', capacityLimit: '' });
      fetchOrganizerData();
      setActiveTab('events');
    } catch (error) {
      alert("Error creating event: " + error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!newEvent.title) return alert("Please enter an event title first.");
    try {
      setGeneratingDesc(true);
      const res = await api.post('/ai/generate-description', {
        title: newEvent.title,
        category: newEvent.category,
        tags: [newEvent.category]
      });
      setNewEvent(prev => ({ ...prev, description: res.description }));
    } catch (error) {
      alert("Error generating description: " + error.message);
    } finally {
      setGeneratingDesc(false);
    }
  };

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

  const handleExportExcel = () => {
    if (participants.length === 0) return alert("No participants to export.");
    const data = participants.map(p => ({
      Name: p.studentId?.name || 'Unknown',
      Email: p.studentId?.email || 'Unknown',
      Branch: p.studentId?.branch || 'N/A',
      ID: p.studentId?.qrData || 'N/A',
      CheckedIn: p.checkedIn ? 'Yes' : 'No'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `Participants_${selectedEventId}.xlsx`);
  };

  // QR Scanner logic
  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(async (decodedText) => {
        scanner.clear();
        setScanning(false);
        try {
          const payload = JSON.parse(decodedText);
          const studentId = payload.id;
          if (!studentId) throw new Error("Invalid QR code format");
          
          await api.post(`/events/${selectedEventId}/check-in`, { studentId });
          alert("Check-in successful for " + (payload.name || "Student"));
          fetchParticipants(selectedEventId); // Refresh list
        } catch (error) {
          alert("Check-in failed: " + (error.message || "Invalid QR data"));
        }
      }, (err) => {
        // Handle scan errors quietly
      });

      return () => {
        scanner.clear().catch(e => console.log("Failed to clear scanner", e));
      };
    }
  }, [scanning, selectedEventId]);

  const tabs = [
    { id: 'events', label: 'My Events', icon: <Settings size={16} /> },
    { id: 'create', label: 'Create Event', icon: <Plus size={16} /> },
    { id: 'registrations', label: 'Registrations & Check-in', icon: <Users size={16} /> },
    { id: 'announcements', label: 'Announcements', icon: <MessageSquare size={16} /> },
  ];

  if (loading && events.length === 0) {
    return <div className="flex justify-center items-center h-64 text-primary">Loading organizer dashboard...</div>;
  }

  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registrationCount || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-4">
        <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
        <p className="text-gray-400">Create events, manage registrations, check-in students, and broadcast announcements.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Events', value: events.length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Settings size={18} /> },
          { label: 'Total Registrations', value: totalRegistrations, color: 'text-green-400', bg: 'bg-green-500/10', icon: <Users size={18} /> },
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
          <h2 className="text-xl font-bold">My Events</h2>
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
                </div>
              ))
            )}
          </div>
        </motion.section>
      )}

      {activeTab === 'create' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <form onSubmit={handleCreateEvent} className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-4">Create New Event</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-300 mb-1 block">Event Title</label>
                <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-sm font-medium text-gray-300">Description</label>
                  <button type="button" onClick={handleGenerateAI} disabled={generatingDesc} className="text-xs text-purple-400 flex items-center gap-1 hover:underline disabled:opacity-50">
                    <Wand2 size={12} /> {generatingDesc ? 'Generating...' : 'Auto-Generate'}
                  </button>
                </div>
                <textarea required rows={4} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Category</label>
                <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                  {['Workshop', 'Seminar', 'Hackathon', 'Sports', 'Cultural', 'Fest', 'Competition'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Capacity Limit</label>
                <input type="number" value={newEvent.capacityLimit} onChange={e => setNewEvent({...newEvent, capacityLimit: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" placeholder="Optional" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Date</label>
                <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Venue</label>
                <input type="text" required value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Start Time</label>
                <input type="time" required value={newEvent.startTime} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">End Time</label>
                <input type="time" required value={newEvent.endTime} onChange={e => setNewEvent({...newEvent, endTime: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={creating} className="btn-primary py-2 px-6 disabled:opacity-50">
                {creating ? 'Creating...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        </motion.section>
      )}

      {activeTab === 'registrations' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-gray-300 mb-1 block">Select Event</label>
                <select 
                  className="w-full md:w-64 bg-surface border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary/50"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setScanning(!scanning)} className="btn-primary py-2 flex items-center gap-2">
                  <ScanLine size={16} /> {scanning ? 'Close Scanner' : 'Scan QR'}
                </button>
                <button onClick={handleExportExcel} className="btn-secondary py-2 flex items-center gap-2">
                  <Download size={16} /> Export Excel
                </button>
              </div>
            </div>

            {scanning && (
              <div className="mb-6 p-4 border-2 border-dashed border-primary/50 rounded-lg">
                <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-lg"></div>
                <p className="text-center text-sm text-gray-400 mt-2">Point camera at student's Entry Pass</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Roll/ID</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold">{p.studentId?.name || 'Unknown'}</td>
                      <td className="p-3 text-gray-300 text-sm">{p.studentId?.email || 'N/A'}</td>
                      <td className="p-3 text-gray-300 text-sm">{p.studentId?.branch || 'N/A'}</td>
                      <td className="p-3 font-mono text-xs text-gray-400">{p.studentId?.qrData || 'N/A'}</td>
                      <td className="p-3">
                        {p.checkedIn 
                          ? <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Checked In</span>
                          : <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full">Pending</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {participants.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-500 italic">No participants found for this event.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
