import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import BridgeStatus from './components/BridgeStatus/BridgeStatus';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'bridge':
        return <BridgeStatus onBack={() => setActiveTab('dashboard')} />;
      default:
        return (
          <div className="placeholder-view">
            <h2>Coming Soon</h2>
            <p>We are still building the {activeTab} experience.</p>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default App;

