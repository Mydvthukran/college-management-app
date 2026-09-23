import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoProfiles = [
  { role: 'Admin', label: 'Test Admin' },
  { role: 'Student', label: 'Test Student' },
  { role: 'Organizer', label: 'Test Organizer' },
  { role: 'Teacher', label: 'Test Teacher' },
  { role: 'Club Lead', label: 'Test Club Lead' },
];

const getRolePath = (role) => {
  const roleRedirects = {
    Student: '/dashboard',
    'Club Lead': '/dashboard',
    Organizer: '/organizer',
    Teacher: '/teacher',
    Admin: '/admin',
  };

  return roleRedirects[role] || '/dashboard';
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    navigate(getRolePath(user.role), { replace: true });
    return null;
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser = await login(formData.email, formData.password);
      navigate(getRolePath(loggedInUser.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    setError('');

    try {
      const demoUser = loginAsDemo(role);
      navigate(getRolePath(demoUser.role));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 md:p-12 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-4xl font-bold tracking-tighter text-white mb-1">
            SIET<span className="text-primary">.</span>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2 mt-4">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Sign in to access your campus dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-surface border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-surface border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex justify-center items-center mt-2"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 013 19.938l-2.647-3z"
                ></path>
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10"></div>
          <span className="text-[11px] uppercase tracking-wider text-gray-500">Demo Access</span>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {demoProfiles.map((profile) => (
            <button
              key={profile.role}
              type="button"
              onClick={() => handleDemoLogin(profile.role)}
              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
            >
              {profile.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-600">
          Demo profiles are for UI/testing only and do not use the production database.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
