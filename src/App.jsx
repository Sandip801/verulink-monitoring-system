import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import BridgeStatus from './components/BridgeStatus/BridgeStatus';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigateToBridgeStatus = () => {
    setCurrentPage('bridge-status');
  };

  const handleNavigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        {currentPage === 'dashboard' ? (
          <Dashboard onBridgeStatusClick={handleNavigateToBridgeStatus} />
        ) : (
          <BridgeStatus onBack={handleNavigateToDashboard} />
        )}
      </div>
    </div>
  );
}

export default App;

