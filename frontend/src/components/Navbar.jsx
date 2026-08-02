import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If on login page, show minimal navbar
  if (location.pathname === '/') {
    return (
      <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-center">
          <span className="text-2xl font-bold tracking-tighter text-white">
            SIET<span className="text-primary">.</span>
          </span>
        </div>
      </nav>
    );
  }

  // Build nav links based on user role
  const getNavLinks = () => {
    if (!isAuthenticated || !user) return [];

    const role = user.role;

    switch (role) {
      case 'Student':
      case 'Club Lead':
        return [
          { path: '/home', label: 'Home' },
          { path: '/leaderboard', label: 'Leaderboard' },
          { path: '/dashboard', label: 'Dashboard' },
        ];
      case 'Organizer':
        return [
          { path: '/home', label: 'Home' },
          { path: '/leaderboard', label: 'Leaderboard' },
          { path: '/organizer', label: 'Dashboard' },
          { path: '/judge', label: 'Judging Panel' },
        ];
      case 'Teacher':
        return [
          { path: '/home', label: 'Home' },
          { path: '/leaderboard', label: 'Leaderboard' },
          { path: '/teacher', label: 'Dashboard' },
        ];
      case 'Admin':
        return [
          { path: '/home', label: 'Home' },
          { path: '/leaderboard', label: 'Leaderboard' },
          { path: '/admin', label: 'Dashboard' },
          { path: '/dashboard', label: 'Student View' },
          { path: '/teacher', label: 'Faculty View' },
          { path: '/organizer', label: 'Organizer View' },
          { path: '/judge', label: 'Judging Panel' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return '??';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tighter text-white">
            SIET<span className="text-primary">.</span>
          </span>
          {user && (
            <span className="hidden sm:inline-block text-xs font-medium text-gray-500 bg-surface px-2.5 py-1 rounded-full border border-white/5">
              {user.role}
            </span>
          )}
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors py-2">
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* User avatar */}
          <div className="w-10 h-10 rounded-full bg-surface border border-white/10 hidden md:flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">{getInitials()}</span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
          >
            <LogOut size={16} /> Logout
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-gray-300 hover:text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-20 left-0 w-full bg-surface border-b border-white/10 shadow-xl"
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 rounded-lg font-medium transition-colors ${location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  {link.label}
                </Link>
              ))}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                className="p-3 rounded-lg font-medium text-red-400 hover:bg-red-500/10 text-left flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
