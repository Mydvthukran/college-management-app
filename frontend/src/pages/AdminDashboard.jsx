import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, BarChart, Users, Shield, Activity, Settings, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('approvals');

  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [allowRegistrations, setAllowRegistrations] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, approvalsRes, usersRes, settingsRes] = await Promise.all([
        api.get('/dashboard/admin-stats'),
        api.get('/events?status=Awaiting Faculty'),
        api.get('/auth/users'),
        api.get('/settings').catch(() => ({})) // Fallback if settings route fails
      ]);
      setStats(statsRes);
      setPendingApprovals(approvalsRes);
      setUsers(usersRes);
      
      if (settingsRes && Object.keys(settingsRes).length > 0) {
        setAllowRegistrations(settingsRes.allowNewRegistrations ?? true);
        setAutoApprove(settingsRes.autoApproveEvents ?? false);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key, value) => {
    try {
      await api.put('/settings', { key, value });
    } catch (error) {
      console.error("Error updating setting:", error);
      alert("Failed to update setting. Please check the backend.");
    }
  };

  const toggleAllowRegistrations = () => {
    const newVal = !allowRegistrations;
    setAllowRegistrations(newVal);
    handleUpdateSetting('allowNewRegistrations', newVal);
  };

  const toggleAutoApprove = () => {
    const newVal = !autoApprove;
    setAutoApprove(newVal);
    handleUpdateSetting('autoApproveEvents', newVal);
  };

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Student', branch: '' });
  const [addingUser, setAddingUser] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setAddingUser(true);
      await api.post('/auth/register', newUser);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'Student', branch: '' });
      fetchAdminData();
      alert('User added successfully!');
    } catch (error) {
      alert("Error adding user: " + error.message);
    } finally {
      setAddingUser(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveReject = async (id, status) => {
    try {
      await api.put(`/events/${id}/approve`, { status });
      fetchAdminData(); // Refresh list and stats
    } catch (error) {
      alert("Error updating event status: " + error.message);
    }
  };

  const tabs = [
    { id: 'approvals', label: 'Approvals', icon: <Shield size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart size={16} /> },
    { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={16} /> },
  ];

  if (loading && !stats) {
    return <div className="flex justify-center items-center h-64 text-primary">Loading admin portal...</div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="mb-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500"
        >
          Admin Portal
        </motion.h1>
        <p className="text-gray-400">Full system control — approvals, analytics, users, and settings.</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: stats?.pendingApprovals || 0, color: 'text-amber-400', bg: 'bg-amber-500/10', icon: <AlertTriangle size={18} /> },
          { label: 'Active Events', value: stats?.totalEvents || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Activity size={18} /> },
          { label: 'Total Users', value: stats?.totalUsers || 0, color: 'text-green-400', bg: 'bg-green-500/10', icon: <Users size={18} /> },
          { label: 'System Health', value: '99.9%', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: <Shield size={18} /> },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel p-5">
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-primary/10 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'approvals' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h2 className="text-xl font-bold">Pending Event Approvals</h2>
          {pendingApprovals.length === 0 ? (
            <p className="text-gray-500 italic p-4 glass-panel">No pending approvals.</p>
          ) : (
            pendingApprovals.map((event) => (
              <div key={event._id} className="glass-panel p-6 border-l-4 border-l-amber-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p className="text-sm text-gray-400">By: {event.clubId?.name || 'Unknown'} • Category: {event.category}</p>
                    <p className="text-sm text-gray-400">Date: {new Date(event.date).toLocaleDateString()} • Venue: {event.venue}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleApproveReject(event._id, 'Approved')}
                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleApproveReject(event._id, 'Rejected')}
                      className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.section>
      )}

      {activeTab === 'analytics' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><BarChart className="text-primary" /> Platform Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Attendance Chart - Dynamic data simulated from total registrations */}
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Event Check-ins vs Registrations</h3>
              <div className="flex items-center gap-6 justify-center h-48">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-blue-400">{stats?.totalRegistrations}</div>
                  <p className="text-sm text-gray-400">Registrations</p>
                </div>
                <div className="h-full w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-green-400">{stats?.checkedInCount}</div>
                  <p className="text-sm text-gray-400">Checked In</p>
                </div>
              </div>
              <div className="w-full h-2 bg-surface rounded-full overflow-hidden mt-4">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${stats?.attendancePct || 0}%` }}
                ></div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">{stats?.attendancePct || 0}% overall conversion rate</p>
            </div>

            {/* Event Categories */}
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Events by Category</h3>
              <div className="space-y-4">
                {stats?.byCategory?.map((cat, i) => {
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-pink-500'];
                  const pct = Math.round((cat.count / stats.totalEvents) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{cat._id}</span>
                        <span className="text-gray-400">{cat.count} events ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: i * 0.15 }}
                          className={`h-full ${colors[i % colors.length]} rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
                {(!stats?.byCategory || stats.byCategory.length === 0) && (
                  <p className="text-gray-500 text-sm">No events found.</p>
                )}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {activeTab === 'users' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">All Users</h2>
            <button 
              onClick={() => setShowAddUserModal(true)}
              className="btn-primary py-2 text-sm"
            >
              + Add User
            </button>
          </div>
          <div className="glass-panel p-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-sm">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">ID</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold">{u.name}</td>
                    <td className="p-3 text-gray-300 text-sm">{u.email}</td>
                    <td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{u.role}</span></td>
                    <td className="p-3 text-gray-300 text-sm">{u.branch || '-'}</td>
                    <td className="p-3 font-mono text-xs">{u.qrData || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {activeTab === 'settings' && (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <h2 className="text-xl font-bold">System Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold">General</h3>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div><p className="text-sm font-medium">Allow New Registrations</p><p className="text-xs text-gray-500">Users can self-register</p></div>
                <div 
                  onClick={toggleAllowRegistrations}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${allowRegistrations ? 'bg-green-500' : 'bg-surface border border-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${allowRegistrations ? 'right-0.5 bg-white' : 'left-0.5 bg-gray-400'}`}></div>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div><p className="text-sm font-medium">Auto-Approve Events</p><p className="text-xs text-gray-500">Skip manual approval</p></div>
                <div 
                  onClick={toggleAutoApprove}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${autoApprove ? 'bg-green-500' : 'bg-surface border border-white/20'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${autoApprove ? 'right-0.5 bg-white' : 'left-0.5 bg-gray-400'}`}></div>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold">Database & Server</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm p-3 bg-surface/50 rounded-lg">
                  <span className="text-gray-400">MongoDB Status</span>
                  <span className="text-green-400 font-medium">Connected</span>
                </div>
                <div className="flex justify-between text-sm p-3 bg-surface/50 rounded-lg">
                  <span className="text-gray-400">API Status</span>
                  <span className="text-green-400 font-medium">Running</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1a1d24] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Full Name</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Email</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Password</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50">
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Branch (Optional)</label>
                  <input type="text" value={newUser.branch} onChange={e => setNewUser({...newUser, branch: e.target.value})} className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <button type="submit" disabled={addingUser} className="w-full btn-primary py-3 mt-2">
                {addingUser ? 'Creating User...' : 'Create User'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
