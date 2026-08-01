import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Student Dashboard' },
    { path: '/teacher', label: 'Faculty Portal' },
    { path: '/judge', label: 'Judge Panel' }
  ];

  return (
    <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
          Nexus<span className="text-primary">.</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <span className="text-sm font-semibold">JD</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
