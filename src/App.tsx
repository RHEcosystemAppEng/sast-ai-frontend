import React from 'react';
import { DashboardProvider } from './context/DashboardContext';
import AppRouter from './app';

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <AppRouter />
    </DashboardProvider>
  );
};

export default App;
