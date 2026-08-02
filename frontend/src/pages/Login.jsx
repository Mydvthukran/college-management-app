import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '', // Using email as ID for the backend
    password: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock login logic as requested
      // We simulate a network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (formData.email && formData.password) {
        // Create a mock user based on the inputs
        const mockUser = {
          id: 'mock-id-1234',
          name: formData.email.split('@')[0],
          role: formData.role,
          qrData: `NXC-${formData.role.substring(0, 3).toUpperCase()}-MOCK`
        };

        // Store token and user
        localStorage.setItem('token', 'mock-jwt-token-xyz');
        localStorage.setItem('user', JSON.stringify(mockUser));

        // Redirect based on selected role
        const userRole = formData.role;
        
        if (userRole === 'Organizer') {
          navigate('/organizer');
        } else if (userRole === 'Admin') {
          navigate('/admin');
        } else if (userRole === 'Teacher') {
          navigate('/teacher');
        } else {
          navigate('/dashboard'); // default to student dashboard
        }
      } else {
        throw new Error('Please enter ID/Email and password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to access your campus dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full bg-surface border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="Student">Student</option>
              <option value="Organizer">Organizer</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">ID / Email</label>
            <input 
              type="text" 
              name="email"
              placeholder="Enter your ID or Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-surface border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
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
            className="w-full btn-primary py-3 flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Mock login is active.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
