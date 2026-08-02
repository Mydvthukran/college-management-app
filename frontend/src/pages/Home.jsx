import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Award, TrendingUp, Clock, Bell, Activity, BarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Home = () => {
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [todayEvents, setTodayEvents] = useState([]);
  const [weekEvents, setWeekEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, upcomingRes, annRes] = await Promise.all([
          api.get('/dashboard/admin-stats'), // Using admin stats for campus overview
          api.get('/events/upcoming'),
          api.get('/announcements')
        ]);
        
        setStats(statsRes);
        setTodayEvents(upcomingRes.today || []);
        setWeekEvents(upcomingRes.week || []);
        setAnnouncements(annRes || []);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHomeData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-primary">Loading campus overview...</div>;
  }

  return (
    <div className="space-y-8">
      <header className="mb-4">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold mb-2"
        >
          Campus Overview
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          Welcome, <span className="text-primary">{user?.name || 'User'}</span> — here's what's happening on campus today.
        </motion.p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats?.totalEvents || 0, icon: <Calendar size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users size={18} />, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Total Registrations', value: stats?.totalRegistrations || 0, icon: <Award size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Avg Attendance', value: `${stats?.attendancePct || 0}%`, icon: <TrendingUp size={18} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Events */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="text-primary" size={20} /> Today's Events
          </h2>
          {todayEvents.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No events scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event, i) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass-panel p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:border-primary/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-surface px-2 py-0.5 rounded border border-white/10">{event.category}</span>
                      <span className="text-xs text-primary font-medium">{event.startTime} — {event.endTime}</span>
                    </div>
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Clock size={12} /> {event.venue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{event.registrationCount || 0}</p>
                    <p className="text-xs text-gray-500">registered</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upcoming This Week */}
          <h2 className="text-xl font-semibold flex items-center gap-2 pt-4">
            <Activity className="text-purple-400" size={20} /> Upcoming This Week
          </h2>
          {weekEvents.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No more events scheduled this week.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weekEvents.map((event, i) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass-panel p-5 relative overflow-hidden group hover:border-purple-500/20 transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{event.category}</span>
                    <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                  <p className="text-xs text-amber-400 font-medium">
                    {event.capacityLimit ? `${Math.max(0, event.capacityLimit - (event.registrationCount || 0))} spots left` : 'Unlimited spots'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Announcements */}
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Bell className="text-amber-400" size={18} /> Announcements
            </h3>
            {announcements.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No new announcements.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann._id} className="p-3 rounded-lg border bg-surface/50 border-white/5">
                    <p className="text-sm">{ann.message}</p>
                    <div className="flex justify-between mt-2">
                      <p className="text-xs text-primary font-medium">{ann.eventId?.title || 'General'}</p>
                      <p className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart className="text-green-400" size={18} /> Top Active Students
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Sneha Gupta', events: 14, rank: 1 },
                { name: 'Rahul Sharma', events: 12, rank: 2 },
                { name: 'Ananya Reddy', events: 11, rank: 3 },
                { name: 'Priya Patel', events: 10, rank: 4 },
                { name: 'Arjun Kumar', events: 8, rank: 5 },
              ].map((student, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' :
                      i === 1 ? 'bg-gray-300/20 text-gray-300' :
                      i === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-surface text-gray-500'
                    }`}>{student.rank}</span>
                    <span className="text-sm font-medium">{student.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{student.events} events</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
