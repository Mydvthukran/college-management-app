import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

const OrbiHelper = () => {
  const location = useLocation();
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  const routeMessages = {
    '/': "Welcome to SIET! Sign in to access your customized dashboard.",
    '/home': "This is your Campus Overview! Here you can see a quick summary of today's events, announcements, and the top active students.",
    '/dashboard': "Welcome to the Student Dashboard! View your upcoming schedule, register for new events, and download your certificates.",
    '/admin': "Admin Portal active! You have full control here to approve events, manage system settings, and oversee all users.",
    '/organizer': "Organizer Dashboard: Time to manage your events! You can create new events, send broadcasts, and scan QR entry passes.",
    '/teacher': "Faculty Portal: Welcome! Here you can approve duty leave requests, track attendance, and generate NAAC reports.",
    '/judge': "Judging Panel: Welcome to the evaluation center. You can score teams and manage hackathon submissions here."
  };

  useEffect(() => {
    // When route changes, determine the message
    const message = routeMessages[location.pathname];
    
    if (message) {
      setCurrentMessage(message);
      setShowMessage(false); // Reset animation if already showing
      
      // Small delay to allow page transition before showing message
      const showTimer = setTimeout(() => {
        setShowMessage(true);
      }, 500);

      // Auto hide after 8 seconds
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, 8500);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      setShowMessage(false);
    }
  }, [location.pathname]);

  // Click handler to toggle message manually if user clicks Orbi
  const handleOrbiClick = () => {
    if (!showMessage && currentMessage) {
      setShowMessage(true);
      // Auto hide again
      setTimeout(() => setShowMessage(false), 6000);
    } else {
      setShowMessage(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end justify-end pointer-events-none">
      
      {/* Text Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto absolute bottom-4 right-20 w-64 md:w-72 glass-panel p-4 rounded-2xl rounded-br-sm bg-surface/90 border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <button 
              onClick={() => setShowMessage(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex gap-2 items-start text-sm text-gray-200 mt-1">
              <Sparkles className="text-primary flex-shrink-0 mt-0.5" size={16} />
              <p className="leading-relaxed">{currentMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbi Character */}
      <motion.div
        className="pointer-events-auto relative cursor-pointer"
        onClick={handleOrbiClick}
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse"></div>
        
        {/* Core Orb */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 via-primary to-purple-600 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center border-2 border-white/20 overflow-hidden">
          
          {/* Inner highlight for 3D effect */}
          <div className="absolute top-1 left-2 w-4 h-4 bg-white/40 rounded-full blur-[2px]"></div>
          
          {/* Orbi's Eye (Animated) */}
          <motion.div 
            className="w-4 h-4 bg-white rounded-full flex items-center justify-center"
            animate={{ 
              scaleY: [1, 0.1, 1, 1, 1, 1, 1], // Blinking
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              times: [0, 0.05, 0.1, 0.5, 0.6, 0.9, 1] 
            }}
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          </motion.div>
        </div>
      </motion.div>

    </div>
  );
};

export default OrbiHelper;
