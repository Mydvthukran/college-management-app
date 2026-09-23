import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://college-management-app-guqk.onrender.com/api';

const DEMO_PROFILES = {
  Admin: {
    id: 'demo-admin',
    name: 'Test Admin',
    role: 'Admin',
    email: 'test-admin@demo.local',
    qrData: 'SIET-DEMO-ADMIN',
  },
  Student: {
    id: 'demo-student',
    name: 'Test Student',
    role: 'Student',
    email: 'test-student@demo.local',
    branch: 'CSE',
    qrData: 'SIET-DEMO-STUDENT',
  },
  Organizer: {
    id: 'demo-organizer',
    name: 'Test Organizer',
    role: 'Organizer',
    email: 'test-organizer@demo.local',
    qrData: 'SIET-DEMO-ORGANIZER',
  },
  Teacher: {
    id: 'demo-teacher',
    name: 'Test Teacher',
    role: 'Teacher',
    email: 'test-teacher@demo.local',
    qrData: 'SIET-DEMO-TEACHER',
  },
  'Club Lead': {
    id: 'demo-club-lead',
    name: 'Test Club Lead',
    role: 'Club Lead',
    email: 'test-club-lead@demo.local',
    branch: 'CSE',
    qrData: 'SIET-DEMO-CLUB',
  },
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  const loginAsDemo = (role) => {
    const profile = DEMO_PROFILES[role];

    if (!profile) {
      throw new Error('Unknown demo profile');
    }

    const demoToken = `DEMO_${role.toUpperCase().replace(/\\s+/g, '_')}`;

    localStorage.setItem('token', demoToken);
    localStorage.setItem('user', JSON.stringify(profile));
    localStorage.setItem('demoMode', 'true');

    setToken(demoToken);
    setUser(profile);

    return profile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
