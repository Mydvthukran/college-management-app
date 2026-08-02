import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-primary" /> My Schedule
            </h2>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Tomorrow, 10:00 AM</div>
                    <h3 className="text-lg font-bold">Advanced Web Dev Workshop</h3>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                      <Clock size={14} /> Main Auditorium
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-surface border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* AI Recommendations */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-400">
              ✨ Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-lg font-bold mb-2">HackTheCampus 2026</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    Join the 48-hour coding marathon. Build amazing projects and win exciting prizes.
                  </p>
                  <button className="text-primary text-sm font-semibold hover:underline">
                    Register Now →
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* QR Code Entry */}
          <div className="glass-panel p-8 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold mb-2">Your Entry Pass</h3>
            <p className="text-xs text-gray-400 mb-6">Scan at the venue for instant entry & attendance</p>
            <div className="w-48 h-48 bg-white rounded-xl p-2 flex items-center justify-center mb-6">
              <QrCode size={120} className="text-black" />
            </div>
            <p className="text-sm font-mono text-gray-300 bg-surface px-4 py-1.5 rounded-full border border-white/5">
              ID: {user?.qrData || 'SIET-0000'}
            </p>
          </div>

          {/* Certificates */}
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-400" size={18} /> Recent Certificates
            </h3>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                  <span className="text-sm font-medium">React Masterclass</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
