import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, BookOpen, Bell, User, Award, TrendingUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  const tabs = [
    { id: 'schedule', label: 'My Schedule', icon: <Calendar size={16} /> },
    { id: 'events', label: 'Events & Clubs', icon: <BookOpen size={16} /> },
    { id: 'pass', label: 'Entry Pass', icon: <Award size={16} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={16} /> },
  ];

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
          { label: 'Events Attended', value: '12', icon: <Calendar size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Certificates', value: '5', icon: <Award size={18} />, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Attendance', value: '87%', icon: <TrendingUp size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Notifications', value: '3', icon: <Bell size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
            <Calendar className="text-primary" /> Upcoming Events
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Advanced Web Dev Workshop', time: 'Tomorrow, 10:00 AM', venue: 'Main Auditorium', tag: 'Workshop' },
              { title: 'AI/ML Bootcamp Day 2', time: 'Aug 5, 2:00 PM', venue: 'Seminar Hall A', tag: 'Bootcamp' },
              { title: 'Inter-College Hackathon', time: 'Aug 8, 9:00 AM', venue: 'CS Lab Complex', tag: 'Hackathon' },
            ].map((event, i) => (
              <div key={i} className="glass-panel p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:border-primary/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{event.time}</span>
                    <span className="text-xs bg-surface px-2 py-0.5 rounded-full border border-white/10">{event.tag}</span>
                  </div>
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                    <Clock size={14} /> {event.venue}
                  </p>
                </div>
                <button className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <h2 className="text-xl font-semibold flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 pt-4">
            ✨ Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'HackTheCampus 2026', desc: 'Join the 48-hour coding marathon with prizes worth ₹50K.', tag: 'Hackathon' },
              { title: 'Flutter Workshop', desc: 'Build cross-platform mobile apps from scratch.', tag: 'Workshop' },
              { title: 'Robotics Club Meet', desc: 'Weekly meetup — learn Arduino and IoT basics.', tag: 'Club' },
            ].map((item, i) => (
              <div key={i} className="glass-panel p-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{item.tag}</span>
                <h3 className="text-lg font-bold mt-2 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{item.desc}</p>
                <button className="text-primary text-sm font-semibold hover:underline">Register Now →</button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'events' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-semibold">Registered Events</h2>
          <div className="space-y-3">
            {[
              { title: 'Tech Symposium 2026', date: 'Oct 15', status: 'Confirmed', statusColor: 'text-green-400 bg-green-500/10 border-green-500/30' },
              { title: 'Code Sprint Challenge', date: 'Oct 20', status: 'Waitlisted', statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
              { title: 'UI/UX Design Jam', date: 'Oct 25', status: 'Confirmed', statusColor: 'text-green-400 bg-green-500/10 border-green-500/30' },
            ].map((event, i) => (
              <div key={i} className="glass-panel p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{event.title}</h3>
                  <p className="text-sm text-gray-400">{event.date}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${event.statusColor}`}>{event.status}</span>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold pt-4">Clubs You Follow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Coding Club', members: 245, desc: 'Competitive programming and hackathons' },
              { name: 'Robotics Club', members: 120, desc: 'Arduino, IoT and embedded systems' },
              { name: 'Design Club', members: 89, desc: 'UI/UX design and creative projects' },
              { name: 'AI/ML Society', members: 178, desc: 'Machine learning and data science' },
            ].map((club, i) => (
              <div key={i} className="glass-panel p-5 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{club.name}</h3>
                  <p className="text-xs text-gray-400">{club.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{club.members}</p>
                  <p className="text-xs text-gray-500">members</p>
                </div>
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
              {[
                { title: 'React Masterclass', date: 'Sep 12, 2026', org: 'Coding Club' },
                { title: 'AI/ML Bootcamp', date: 'Aug 28, 2026', org: 'AI Society' },
                { title: 'Web Dev Workshop', date: 'Aug 15, 2026', org: 'GDSC SIET' },
                { title: 'Intro to Cloud Computing', date: 'Jul 20, 2026', org: 'AWS Club' },
              ].map((cert, i) => (
                <div key={i} className="glass-panel p-4 flex items-center justify-between hover:border-green-500/20 transition-colors cursor-pointer">
                  <div>
                    <p className="font-semibold text-sm">{cert.title}</p>
                    <p className="text-xs text-gray-500">{cert.date} • {cert.org}</p>
                  </div>
                  <button className="text-xs text-primary hover:underline font-medium">Download</button>
                </div>
              ))}
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

            {/* Interests */}
            <div className="glass-panel p-6 md:col-span-2">
              <h3 className="font-bold mb-4">Your Interests</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {(user?.interests || ['Coding', 'Hackathons', 'AI/ML', 'Web Dev']).map((tag, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full font-medium">{tag}</span>
                ))}
              </div>

              <h3 className="font-bold mb-4 mt-6">Attendance History</h3>
              <div className="space-y-2">
                {[
                  { event: 'Web Dev Workshop', date: 'Oct 12', status: 'Present' },
                  { event: 'AI Seminar', date: 'Oct 10', status: 'Present' },
                  { event: 'Robotics Demo Day', date: 'Oct 8', status: 'Absent' },
                  { event: 'Code Sprint', date: 'Oct 5', status: 'Present' },
                  { event: 'Design Thinking Workshop', date: 'Oct 1', status: 'Present' },
                ].map((record, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-surface/50 border border-white/5">
                    <div>
                      <p className="text-sm font-medium">{record.event}</p>
                      <p className="text-xs text-gray-500">{record.date}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${record.status === 'Present' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
