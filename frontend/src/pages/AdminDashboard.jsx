import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, BarChart } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <header className="mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500"
        >
          Admin Portal
        </motion.h1>
        <p className="text-gray-400">Manage Event Approvals and Analytics</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-panel p-6 border-l-4 border-l-accent flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold">Tech Symposium 2026</h3>
                  <p className="text-sm text-gray-400 mt-1">Requested by: Coding Club</p>
                  <p className="text-sm text-gray-400">Budget: $500 • Date: Oct 15</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 bg-green-500/20 text-green-400 border border-green-500/50 py-2 rounded-lg text-sm font-semibold hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Check size={16} /> Approve
                  </button>
                  <button className="flex-1 bg-red-500/20 text-red-400 border border-red-500/50 py-2 rounded-lg text-sm font-semibold hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart className="text-primary" /> Live Analytics
          </h2>
          <div className="glass-panel p-6">
            <div className="h-64 flex items-end justify-between gap-2 pb-4 border-b border-white/10 relative">
              {/* Mock Bar Chart */}
              {[40, 70, 45, 90, 65, 30].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-1/6 bg-gradient-to-t from-primary/20 to-primary rounded-t-sm"
                ></motion.div>
              ))}
              <div className="absolute top-0 right-0 text-xs text-gray-500">Max: 300 Users</div>
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
