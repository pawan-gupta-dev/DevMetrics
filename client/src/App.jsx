import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ICDashboard from './pages/ICDashboard';
import ManagerSummary from './pages/ManagerSummary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link to="/" className="text-2xl font-bold text-white hover:text-good transition">
                  📊 DevMetrics
                </Link>
                <div className="flex gap-6">
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-good transition"
                  >
                    IC Dashboard
                  </Link>
                  <Link
                    to="/manager"
                    className="text-gray-300 hover:text-good transition"
                  >
                    Team Overview
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ICDashboard developerId={1} />} />
          <Route path="/manager" element={<ManagerSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
