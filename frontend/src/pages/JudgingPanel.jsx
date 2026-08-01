import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ArrowRight, User } from 'lucide-react';

const JudgingPanel = () => {
  const [scores, setScores] = useState({ innovation: 5, presentation: 5, technical: 5 });

  const handleSlider = (e, field) => {
    setScores({ ...scores, [field]: parseInt(e.target.value) });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <header className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <Trophy className="text-accent" /> Live Judging
        </h1>
        <p className="text-gray-400">HackTheCampus 2026</p>
      </header>

      <div className="glass-panel p-6 border-t-4 border-t-primary">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center border border-white/20">
            <User className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Team Alpha</h2>
            <p className="text-sm text-gray-400">Project: Smart Attendance System</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-gray-300">Innovation & Creativity</label>
              <span className="font-bold text-primary">{scores.innovation}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" 
              value={scores.innovation} 
              onChange={(e) => handleSlider(e, 'innovation')}
              className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-gray-300">Presentation & Pitch</label>
              <span className="font-bold text-primary">{scores.presentation}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" 
              value={scores.presentation} 
              onChange={(e) => handleSlider(e, 'presentation')}
              className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-semibold text-gray-300">Technical Depth</label>
              <span className="font-bold text-primary">{scores.technical}/10</span>
            </div>
            <input 
              type="range" min="0" max="10" 
              value={scores.technical} 
              onChange={(e) => handleSlider(e, 'technical')}
              className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-2xl font-bold">
            Total: <span className="text-accent">{scores.innovation + scores.presentation + scores.technical}/30</span>
          </div>
          <button className="btn-primary flex items-center gap-2">
            Submit Score <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JudgingPanel;
