import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, BookOpen, Bell, User as UserIcon, Award, TrendingUp, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  
  const [stats, setStats] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  
  // Event Details Modal
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  // Team Registration Modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamEvent, setSelectedTeamEvent] = useState(null);
  const [teamForm, setTeamForm] = useState({ teamName: '', teamMembersStr: '' });

  const handleDownloadCertificate = async (eventId, eventTitle) => {
    try {
      // Direct browser to the URL which will prompt a PDF download
      window.open(`https://college-management-app-guqk.onrender.com/api/events/${eventId}/certificate`, '_blank');
    } catch (error) {
      alert("Error downloading certificate");
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, myEventsRes, recommendedRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/my-events'),
        api.get('/dashboard/recommended')
      ]);
      setStats(statsRes);
      setMyEvents(myEventsRes);
      setRecommended(recommendedRes);
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRegister = async (eventId, isTeamEvent = false, teamData = null) => {
    try {
      if (isTeamEvent && !teamData) {
        // Just open the modal
        const eventObj = recommended.find(e => e._id === eventId);
        setSelectedTeamEvent(eventObj);
        setShowTeamModal(true);
        return;
      }

      setRegistering(true);
      await api.post(`/events/${eventId}/register`, teamData || {});
      await fetchDashboardData(); // Refresh data after registration
      setShowTeamModal(false);
      setTeamForm({ teamName: '', teamMembersStr: '' });
      alert('Registered successfully!');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel your registration?")) return;
    try {
      await api.delete(`/events/${eventId}/register`);
      await fetchDashboardData();
      alert('Registration cancelled.');
    } catch (error) {
      alert(error.response?.data?.error || error.message || 'Failed to cancel registration');
    }
  };

  const submitTeamRegistration = (e) => {
    e.preventDefault();
    const emails = teamForm.teamMembersStr.split(',').map(e => e.trim()).filter(e => e);
    handleRegister(selectedTeamEvent._id, true, { 
      teamName: teamForm.teamName, 
      teamMembers: emails 
    });
  };

  const tabs = [
    { id: 'schedule', label: 'My Schedule', icon: <Calendar size={16} /> },
    { id: 'events', label: 'Events & Clubs', icon: <BookOpen size={16} /> },
    { id: 'pass', label: 'Entry Pass', icon: <Award size={16} /> },
    { id: 'profile', label: 'My Profile', icon: <UserIcon size={16} /> },
  ];

  if (loading && !stats) {
    return <div className="flex justify-center items-center h-64 text-primary">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold mb-2"
          >
            Welcome back, <span className="text-primary">{user?.name || 'Student'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            {user?.branch ? `B.Tech ${user.branch}` : 'Student Dashboard'}
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Active Session
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Events Attended', value: stats?.eventsAttended || 0, icon: <Calendar size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Certificates', value: stats?.certificates || 0, icon: <Award size={18} />, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Attendance', value: `${stats?.attendancePct || 0}%`, icon: <TrendingUp size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Notifications', value: '0', icon: <Bell size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' }, // Hardcoded for now
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="text-primary" /> Upcoming Events (Registered)
          </h2>
          {myEvents.filter(e => e.eventStatus === 'Upcoming' || e.eventStatus === 'Ongoing').length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">You have no upcoming registered events.</p>
          ) : (
            <div className="space-y-4">
              {myEvents.filter(e => e.eventStatus === 'Upcoming' || e.eventStatus === 'Ongoing').map((event, i) => (
                <div key={event._id} className="glass-panel p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-primary/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {new Date(event.date).toLocaleDateString()} {event.startTime}
                      </span>
                      <span className="text-xs bg-surface px-2 py-0.5 rounded-full border border-white/10">{event.category}</span>
                    </div>
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                      <Clock size={14} /> {event.venue}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setSelectedEventDetails(event)}
                      className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleCancelRegistration(event._id)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
                    >
                      Cancel Registration
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          <h2 className="text-xl font-semibold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 pt-4">
            ✨ Recommended for You
          </h2>
          {recommended.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No recommendations right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommended.map((item, i) => (
                <div key={item._id} className="glass-panel p-5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{item.category}</span>
                    <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                  <button 
                    onClick={() => handleRegister(item._id, item.isTeamEvent)}
                    disabled={registering}
                    className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
                  >
                    {item.isTeamEvent ? (registering ? 'Registering...' : 'Register Team →') : (registering ? 'Registering...' : 'Register Now →')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'events' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-semibold">Registered Events History</h2>
          <div className="space-y-3">
            {myEvents.map((event, i) => (
              <div key={event._id} className="glass-panel p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  event.checkedIn 
                    ? 'text-green-400 bg-green-500/10 border-green-500/30' 
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  {event.checkedIn ? 'Attended' : 'Registered'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'pass' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* QR Code */}
            <div className="glass-panel p-8 flex flex-col items-center text-center">
              <h3 className="text-lg font-bold mb-2">Your Dynamic Entry Pass</h3>
              <p className="text-xs text-gray-400 mb-6">Show this at the venue for instant entry & attendance</p>
              <div className="bg-white rounded-2xl p-4 mb-6">
                <QRCodeSVG 
                  value={JSON.stringify({
                    id: user?.id || 'unknown',
                    name: user?.name || 'Student',
                    role: user?.role || 'Student',
                    qrData: user?.qrData || 'SIET-0000',
                    timestamp: new Date().toISOString(),
                  })}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#0F1115"
                />
              </div>
              <p className="text-sm font-mono text-gray-300 bg-surface px-4 py-2 rounded-full border border-white/5">
                {user?.qrData || 'SIET-0000'}
              </p>
              <p className="text-xs text-gray-500 mt-3">QR refreshes every session for security</p>
            </div>

            {/* Certificates */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle className="text-green-400" size={18} /> Your Certificates
              </h3>
              {myEvents.filter(e => e.certificateGenerated).length === 0 ? (
                <p className="text-gray-500 italic p-4 glass-panel">No certificates earned yet.</p>
              ) : (
                myEvents.filter(e => e.certificateGenerated).map((cert, i) => (
                  <div key={cert._id} className="glass-panel p-4 flex items-center justify-between hover:border-green-500/20 transition-colors cursor-pointer">
                    <div>
                      <p className="font-semibold text-sm">{cert.title}</p>
                      <p className="text-xs text-gray-500">{new Date(cert.date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDownloadCertificate(cert._id, cert.title)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="glass-panel p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mb-4 border-2 border-primary/30">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'SU'}
              </div>
              <h3 className="text-xl font-bold">{user?.name || 'Student'}</h3>
              <p className="text-sm text-gray-400 mt-1">{user?.role || 'Student'}</p>
              <div className="w-full mt-6 space-y-3 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Branch</span>
                  <span className="font-medium">{user?.branch || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID</span>
                  <span className="font-mono font-medium">{user?.qrData || 'SIET-0000'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>

            {/* Interests & History */}
            <div className="glass-panel p-6 md:col-span-2">
              <h3 className="font-bold mb-4">Your Interests</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {(user?.interests?.length > 0 ? user.interests : ['Coding', 'Hackathons', 'AI/ML']).map((tag, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full font-medium capitalize">{tag}</span>
                ))}
              </div>

              <h3 className="font-bold mb-4 mt-6">Recent Attendance</h3>
              <div className="space-y-2">
                {myEvents.filter(e => e.checkedIn).slice(0, 5).map((record, i) => (
                  <div key={record._id} className="flex justify-between items-center p-3 rounded-lg bg-surface/50 border border-white/5">
                    <div>
                      <p className="text-sm font-medium">{record.title}</p>
                      <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded text-green-400 bg-green-500/10">
                      Present
                    </span>
                  </div>
                ))}
                {myEvents.filter(e => e.checkedIn).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No attendance records yet.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Event Details Modal */}
      {selectedEventDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1d24] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded mb-2 inline-block">
                  {selectedEventDetails.category}
                </span>
                <h2 className="text-2xl font-bold">{selectedEventDetails.title}</h2>
              </div>
              <button onClick={() => setSelectedEventDetails(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <p>{selectedEventDetails.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="glass-panel p-3 flex items-center gap-3">
                  <Calendar className="text-blue-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-semibold text-white">{new Date(selectedEventDetails.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="glass-panel p-3 flex items-center gap-3">
                  <Clock className="text-purple-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-semibold text-white">{selectedEventDetails.startTime} - {selectedEventDetails.endTime}</p>
                  </div>
                </div>
                <div className="glass-panel p-3 col-span-2 flex items-center gap-3">
                  <Award className="text-amber-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Venue</p>
                    <p className="font-semibold text-white">{selectedEventDetails.venue}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-surface/50 border border-white/5 rounded-lg">
                <p className="font-semibold text-white mb-2">Registration Status</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Registered:</span>
                  <span className="font-mono">{selectedEventDetails.registrationCount || 0} / {selectedEventDetails.capacityLimit || '∞'}</span>
                </div>
                {selectedEventDetails.capacityLimit && (
                  <div className="w-full h-1.5 bg-background rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{width: `${((selectedEventDetails.registrationCount || 0) / selectedEventDetails.capacityLimit) * 100}%`}}></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Team Registration Modal */}
      {showTeamModal && selectedTeamEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1d24] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Register Team</h2>
              <button onClick={() => setShowTeamModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-semibold">{selectedTeamEvent.title}</p>
              <p className="text-xs text-gray-400 mt-1">Max Team Size: {selectedTeamEvent.maxTeamSize || 4} members (including you)</p>
            </div>

            <form onSubmit={submitTeamRegistration} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Team Name</label>
                <input required type="text" value={teamForm.teamName} onChange={e => setTeamForm({...teamForm, teamName: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" placeholder="e.g. Code Ninjas" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Team Members' Emails</label>
                <textarea 
                  value={teamForm.teamMembersStr} 
                  onChange={e => setTeamForm({...teamForm, teamMembersStr: e.target.value})} 
                  className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 h-24 resize-none" 
                  placeholder="Enter emails separated by commas (do not include your own email)"
                />
              </div>
              <button type="submit" disabled={registering} className="w-full btn-primary py-3 mt-2">
                {registering ? 'Validating & Registering...' : 'Complete Team Registration'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
