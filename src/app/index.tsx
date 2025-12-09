import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout/AppLayout';
import DashboardPage from './pages/Dashboard';
import MonitoredPackagesPage from './pages/MonitoredPackages';

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/packages" element={<MonitoredPackagesPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
