import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, X, ChevronRight } from 'lucide-react';

const OrbiHelper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const [currentData, setCurrentData] = useState({ text: '', actionText: '', actionRoute: '' });

  const routeMessages = {
    '/': { text: "Welcome to SIET! Sign in to access your customized dashboard.", actionText: "Sign In Help", actionRoute: "/" },
    '/home': { text: "This is your Campus Overview! Here you can see a quick summary of today's events, announcements, and the top active students.", actionText: "Explore Events", actionRoute: "/dashboard" },
    '/dashboard': { text: "Welcome to the Student Dashboard! View your upcoming schedule, register for new events, and download your certificates.", actionText: "View My Schedule", actionRoute: "/dashboard" },
    '/admin': { text: "Admin Portal active! You have full control here to approve events, manage system settings, and oversee all users.", actionText: "Manage Settings", actionRoute: "/admin" },
    '/organizer': { text: "Organizer Dashboard: Time to manage your events! You can create new events, send broadcasts, and scan QR entry passes.", actionText: "Create Event", actionRoute: "/organizer" },
    '/teacher': { text: "Faculty Portal: Welcome! Here you can approve duty leave requests, track attendance, and generate NAAC reports.", actionText: "Pending Approvals", actionRoute: "/teacher" },
    '/judge': { text: "Judging Panel: Welcome to the evaluation center. You can score teams and manage hackathon submissions here.", actionText: "Start Judging", actionRoute: "/judge" }
  };

  useEffect(() => {
    // When route changes, determine the message
    const data = routeMessages[location.pathname];
    
    if (data) {
      setCurrentData(data);
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

  // Click handler to toggle message manually if user clicks the guide
  const handleGuideClick = () => {
    if (!showMessage && currentData.text) {
      setShowMessage(true);
      // Auto hide again
      setTimeout(() => setShowMessage(false), 8000);
    } else {
      setShowMessage(false);
    }
  };

  return (
    <div className="fixed top-24 right-6 z-50 flex items-start justify-end pointer-events-none">
      
      {/* Text Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="pointer-events-auto absolute top-2 right-20 w-64 md:w-72 glass-panel p-5 rounded-2xl rounded-tr-sm bg-surface/90 border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <button 
              onClick={() => setShowMessage(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="flex gap-2 items-start text-sm text-gray-200 mt-1 mb-4">
              <Sparkles className="text-primary flex-shrink-0 mt-0.5" size={16} />
              <p className="leading-relaxed font-medium">{currentData.text}</p>
            </div>
            
            {/* Quick Action Button */}
            <button 
              onClick={() => {
                navigate(currentData.actionRoute);
                setShowMessage(false);
              }}
              className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              {currentData.actionText} <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Person Character */}
      <motion.div
        className="pointer-events-auto relative cursor-pointer ml-4"
        onClick={handleGuideClick}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Hover Glow */}
        <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full"></div>
        
        {/* Person SVG Wrapper */}
        <div className="relative w-16 h-16 bg-surface border-2 border-primary/50 rounded-full shadow-lg overflow-hidden flex flex-col items-center justify-end bg-gradient-to-b from-surface to-primary/20">
          
          {/* Head */}
          <motion.div 
            className="w-7 h-7 bg-white rounded-full absolute top-2 flex items-center justify-center shadow-inner"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Visor/Glasses */}
            <div className="w-5 h-2.5 bg-primary/80 rounded-full overflow-hidden flex items-center justify-center">
              {/* Animated scanning line in visor */}
              <motion.div 
                className="w-full h-[1px] bg-cyan-300"
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
          
          {/* Body */}
          <div className="w-12 h-6 bg-white rounded-t-xl mt-8">
             <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-400 opacity-20"></div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default OrbiHelper;
