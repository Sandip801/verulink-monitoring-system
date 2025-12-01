import React, { useState, Suspense, lazy } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import BridgeStatus from './components/BridgeStatus/BridgeStatus';

const BlockMonitoringOverview = lazy(() => import('./components/Analytics/Overview/Overview'));
const BlockMonitoringNetwork = lazy(() => import('./components/Analytics/Network/Network'));
const BlockMonitoringContract = lazy(() => import('./components/Analytics/Contract/Contract'));
const BlockMonitoringEvent = lazy(() => import('./components/Analytics/Event/Event'));
const BlockMonitoringSyncBlock = lazy(() => import('./components/Analytics/SyncBlocks/SyncBlocks'));
const BlockMonitoringEventLogs = lazy(() => import('./components/Analytics/EventLogs/EventLogs'));

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
      case 'analytics-network':
        return <BlockMonitoringNetwork />;
      case 'analytics-contract':
        return <BlockMonitoringContract />;
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
      <div className="main-content">
        <Suspense
          fallback={
            <div className="placeholder-view">
              <h2>Loading...</h2>
              <p>Please wait while we prepare the {activeTab} view.</p>
            </div>
          }
        >
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
}

export default App;

