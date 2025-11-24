import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './AppLayout/AppLayout';
import DashboardPage from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
