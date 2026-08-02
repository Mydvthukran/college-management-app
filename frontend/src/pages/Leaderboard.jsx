import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, ChevronDown, Award } from 'lucide-react';
import { api } from '../utils/api';

const Leaderboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch approved events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events?status=Approved');
        setEvents(res);
        if (res.length > 0) setSelectedEventId(res[0]._id);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  // Fetch leaderboard when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    
    // Polling function for real-time feel
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/judging/leaderboard/${selectedEventId}`);
        setLeaderboard(res);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [selectedEventId]);

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="max-w-5xl mx-auto pb-20 relative z-10">
      <header className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-4 border border-primary/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <Trophy size={48} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Live Leaderboard
        </h1>
        
        <div className="flex items-center justify-center gap-2 mt-8 max-w-sm mx-auto relative z-20">
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-surface border border-white/20 rounded-xl p-4 pl-6 text-white text-lg font-medium shadow-xl focus:outline-none focus:border-primary/50 appearance-none transition-colors"
          >
            {events.length === 0 && <option value="">No Competitions Found</option>}
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none" size={24} />
        </div>
      </header>

      {loading && leaderboard.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-primary">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-400">
          <Award size={48} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No scores yet!</h2>
          <p>The judges are currently evaluating the teams. Check back soon!</p>
        </div>
      ) : (
        <>
          {/* Animated Podium for Top 3 */}
          <div className="flex justify-center items-end h-80 gap-2 md:gap-6 mb-16 pt-10">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div 
                initial={{ y: 200, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
                className="w-1/3 max-w-[200px] flex flex-col items-center"
              >
                <div className="mb-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-400/20 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-300 font-bold text-xl mb-2 relative">
                    <Medal className="absolute -top-3 -right-2 text-gray-400 drop-shadow-lg" size={28} />
                    {top3[1]._id?.studentId?.name?.charAt(0) || 'T'}
                  </div>
                  <h3 className="font-bold text-white truncate w-full px-2">{top3[1]._id?.teamName || top3[1]._id?.studentId?.name}</h3>
                  <p className="text-2xl font-bold text-gray-400 mt-1">{top3[1].totalPoints} pts</p>
                </div>
                <div className="w-full bg-gradient-to-t from-surface to-gray-400/20 rounded-t-lg h-32 border-t-2 border-x border-gray-400/50 flex justify-center pt-4 shadow-[0_-5px_20px_rgba(156,163,175,0.1)]">
                  <span className="text-4xl font-bold text-gray-400/50">2</span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <motion.div 
                initial={{ y: 250, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="w-1/3 max-w-[220px] flex flex-col items-center z-10"
              >
                <div className="mb-4 text-center">
                  <div className="w-20 h-20 mx-auto bg-yellow-500/20 border-2 border-yellow-400 rounded-full flex items-center justify-center text-yellow-400 font-bold text-3xl mb-2 relative shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                    <Trophy className="absolute -top-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" size={40} />
                    {top3[0]._id?.studentId?.name?.charAt(0) || 'T'}
                  </div>
                  <h3 className="font-bold text-lg text-white truncate w-full px-2">{top3[0]._id?.teamName || top3[0]._id?.studentId?.name}</h3>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">{top3[0].totalPoints} pts</p>
                </div>
                <div className="w-full bg-gradient-to-t from-surface to-yellow-500/20 rounded-t-lg h-48 border-t-2 border-x border-yellow-400/50 flex justify-center pt-4 shadow-[0_-5px_30px_rgba(250,204,21,0.2)]">
                  <span className="text-5xl font-bold text-yellow-500/50">1</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div 
                initial={{ y: 150, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                className="w-1/3 max-w-[200px] flex flex-col items-center"
              >
                <div className="mb-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-orange-700/20 border-2 border-orange-700 rounded-full flex items-center justify-center text-orange-600 font-bold text-xl mb-2 relative">
                    <Star className="absolute -top-3 -left-2 text-orange-600 drop-shadow-lg" size={24} />
                    {top3[2]._id?.studentId?.name?.charAt(0) || 'T'}
                  </div>
                  <h3 className="font-bold text-white truncate w-full px-2">{top3[2]._id?.teamName || top3[2]._id?.studentId?.name}</h3>
                  <p className="text-2xl font-bold text-orange-500 mt-1">{top3[2].totalPoints} pts</p>
                </div>
                <div className="w-full bg-gradient-to-t from-surface to-orange-700/20 rounded-t-lg h-24 border-t-2 border-x border-orange-700/50 flex justify-center pt-4 shadow-[0_-5px_15px_rgba(194,65,12,0.1)]">
                  <span className="text-4xl font-bold text-orange-700/50">3</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* List for the rest */}
          {others.length > 0 && (
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-300 px-2">Runner Ups</h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {others.map((entry, index) => (
                    <motion.div
                      key={entry._id?._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-surface/50 border border-white/5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-500 w-8 text-center">#{index + 4}</span>
                        <div>
                          <h4 className="font-bold text-white text-lg">{entry._id?.teamName || entry._id?.studentId?.name}</h4>
                          {entry._id?.teamName && <p className="text-xs text-gray-400">Lead: {entry._id?.studentId?.name}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">{entry.totalPoints}</span>
                        <span className="text-xs text-gray-400 ml-1">pts</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
