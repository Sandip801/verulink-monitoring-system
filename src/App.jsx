import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import BridgeStatus from './components/BridgeStatus/BridgeStatus';
import BlockMonitoringOverview from './components/Analytics/Overview/Overview';
import BlockMonitoringContract from './components/Analytics/Contract/Contract';
import BlockMonitoringNetwork from './components/Analytics/Network/Network';
import BlockMonitoringEvent from './components/Analytics/Event/Event';
import BlockMonitoringSyncBlock from './components/Analytics/SyncBlocks/SyncBlocks';
import BlockMonitoringEventLogs from './components/Analytics/EventLogs/EventLogs';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'bridge':
        return <BridgeStatus onBack={() => setActiveTab('dashboard')} />;
      case 'analytics-overview':
        return <BlockMonitoringOverview />;
      case 'analytics-contract':
        return <BlockMonitoringContract />;
      case 'analytics-network':
        return <BlockMonitoringNetwork />;
      case 'analytics-event':
        return <BlockMonitoringEvent />;
      case 'analytics-sync-blocks':
        return <BlockMonitoringSyncBlock />;
      case 'analytics-event-logs':
        return <BlockMonitoringEventLogs />;
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

