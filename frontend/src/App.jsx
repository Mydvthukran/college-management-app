import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import JudgingPanel from './pages/JudgingPanel';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';
import ParticleBackground from './components/ParticleBackground';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public route — Login */}
        <Route path="/" element={<PageWrapper><Login /></PageWrapper>} />

        {/* Home summary — All authenticated users */}
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={['Student', 'Club Lead', 'Organizer', 'Teacher', 'Admin']}>
            <PageWrapper><Home /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Student dashboard — Students, Club Leads, and Admins */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Student', 'Club Lead', 'Admin']}>
            <PageWrapper><Dashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Admin dashboard — Admins only */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <PageWrapper><AdminDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Teacher dashboard — Teachers and Admins */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['Teacher', 'Admin']}>
            <PageWrapper><TeacherDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Organizer dashboard — Organizers and Admins */}
        <Route path="/organizer" element={
          <ProtectedRoute allowedRoles={['Organizer', 'Admin']}>
            <PageWrapper><OrganizerDashboard /></PageWrapper>
          </ProtectedRoute>
        } />

        {/* Judging panel — Organizers and Admins */}
        <Route path="/judge" element={
          <ProtectedRoute allowedRoles={['Organizer', 'Admin']}>
            <PageWrapper><JudgingPanel /></PageWrapper>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen relative overflow-hidden bg-background text-white">
          <ParticleBackground />
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
          </div>
          
          <div className="relative z-10">
            <Navbar />
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
              <AnimatedRoutes />
            </main>
            <AIChatbot />
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
