import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="relative">
          {/* Navigation */}
          <nav className="fixed top-4 right-4 z-40">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/admin"
                className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-white hover:bg-gray-800/90 transition-colors duration-200 group"
                aria-label="Go to Admin Panel"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Admin</span>
              </Link>
            </motion.div>
          </nav>

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;