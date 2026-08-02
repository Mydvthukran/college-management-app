import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, User, Users, CheckCircle, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';

const JudgingPanel = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [selectedReg, setSelectedReg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [scores, setScores] = useState({ innovation: 5, presentation: 5, technical: 5 });
  const [submittedScores, setSubmittedScores] = useState(new Set());

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

  // Fetch registrations when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/${selectedEventId}/registrations`);
        setRegistrations(res);
        setSelectedReg(null); // Reset selection
        setScores({ innovation: 5, presentation: 5, technical: 5 });
      } catch (error) {
        console.error("Failed to fetch registrations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [selectedEventId]);

  const handleSlider = (e, field) => {
    setScores({ ...scores, [field]: parseInt(e.target.value) });
  };

  const handleSubmitScore = async () => {
    if (!selectedReg || !selectedEventId) return;
    try {
      setSubmitting(true);
      await api.post('/judging/submit', {
        eventId: selectedEventId,
        registrationId: selectedReg._id,
        scores: {
          innovation: scores.innovation,
          presentation: scores.presentation,
          technicalDepth: scores.technical
        }
      });
      alert('Score submitted successfully!');
      setSubmittedScores(new Set([...submittedScores, selectedReg._id]));
      setSelectedReg(null); // Clear selection so they pick next team
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEvent = events.find(e => e._id === selectedEventId);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Trophy className="text-accent" /> Live Judging Dashboard
        </h1>
        <div className="flex items-center justify-center gap-2 mt-4 max-w-sm mx-auto relative">
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50 appearance-none"
          >
            {events.length === 0 && <option value="">No Events Found</option>}
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 text-gray-400 pointer-events-none" size={16} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar: Teams/Participants List */}
        <div className="glass-panel p-4 h-[600px] overflow-y-auto">
          <h2 className="font-bold text-lg mb-4 flex justify-between items-center">
            Registered Teams
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{registrations.length}</span>
          </h2>
          
          {loading ? (
            <p className="text-center text-gray-400 py-10">Loading teams...</p>
          ) : registrations.length === 0 ? (
            <p className="text-center text-gray-400 py-10 italic">No registrations found for this event.</p>
          ) : (
            <div className="space-y-2">
              {registrations.map(reg => {
                const isTeam = !!reg.teamName;
                const isScored = submittedScores.has(reg._id);
                const isSelected = selectedReg?._id === reg._id;
                
                return (
                  <button 
                    key={reg._id}
                    onClick={() => {
                      if (!isScored) setSelectedReg(reg);
                    }}
                    disabled={isScored}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between border transition-colors ${
                      isSelected ? 'bg-primary/20 border-primary/50' : 
                      isScored ? 'bg-surface/50 border-white/5 opacity-60 cursor-not-allowed' :
                      'bg-surface hover:bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isTeam ? <Users size={16} className="text-blue-400 flex-shrink-0" /> : <User size={16} className="text-purple-400 flex-shrink-0" />}
                      <div className="truncate">
                        <p className="font-semibold text-sm truncate">{isTeam ? reg.teamName : reg.studentId.name}</p>
                        {isTeam && <p className="text-xs text-gray-400 truncate">Lead: {reg.studentId.name}</p>}
                      </div>
                    </div>
                    {isScored && <CheckCircle size={16} className="text-green-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Area: Scoring Panel */}
        <div className="md:col-span-2">
          {!selectedReg ? (
            <div className="glass-panel h-full flex flex-col items-center justify-center p-10 text-center text-gray-400">
              <Trophy size={48} className="text-surface/50 mb-4" />
              <p>Select a team from the list to begin scoring</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 border-t-4 border-t-primary h-full">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 text-primary">
                  {selectedReg.teamName ? <Users size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedReg.teamName || selectedReg.studentId.name}</h2>
                  {selectedReg.teamName ? (
                    <p className="text-sm text-gray-400">Team Size: {(selectedReg.teamMembers?.length || 0) + 1}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Individual Participant</p>
                  )}
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-gray-200">Innovation & Creativity</label>
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{scores.innovation}/10</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={scores.innovation} 
                    onChange={(e) => handleSlider(e, 'innovation')}
                    className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-gray-200">Presentation & Pitch</label>
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{scores.presentation}/10</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={scores.presentation} 
                    onChange={(e) => handleSlider(e, 'presentation')}
                    className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="font-semibold text-gray-200">Technical Depth</label>
                    <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{scores.technical}/10</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={scores.technical} 
                    onChange={(e) => handleSlider(e, 'technical')}
                    className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="text-2xl font-bold">
                  Total: <span className="text-accent ml-2">{scores.innovation + scores.presentation + scores.technical} / 30</span>
                </div>
                <button 
                  onClick={handleSubmitScore}
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2 px-8 py-3"
                >
                  {submitting ? 'Submitting...' : 'Submit Final Score'} <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JudgingPanel;
