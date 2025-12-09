import React, { useState, Suspense, lazy } from 'react';
import { RefreshCw } from 'lucide-react'; // Import icon for the loading spinner

// 1. IMPORT THE GLOBAL THEME HERE
import './styles/BridgeTheme.css'; 
import './App.css';

import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import BridgeStatus from './components/BridgeStatus/BridgeStatus';

// Lazy Imports
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
      
      <main className="main-content">
        {/* Updated Suspense to use the global loading style */}
        <Suspense
          fallback={
            <div className="loading-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <RefreshCw />
              <p>Loading {activeTab} view...</p>
            </div>
          }
        >
          {renderContent()}
        </Suspense>
      </main>
    </div>
  );
}

export default App;


// import React, { useState, Suspense, lazy } from 'react';
// import { RefreshCw } from 'lucide-react';

// // 1. Theme Variables First
// import './styles/BridgeTheme.css'; 
// // 2. App Layout Second (uses the variables)
// import './App.css'; 

// import Sidebar from './components/Sidebar/Sidebar';
// import Dashboard from './components/Dashboard/Dashboard';
// import BridgeStatus from './components/BridgeStatus/BridgeStatus';

// // Lazy Imports
// const BlockMonitoringOverview = lazy(() => import('./components/Analytics/Overview/Overview'));
// const BlockMonitoringNetwork = lazy(() => import('./components/Analytics/Network/Network'));
// const BlockMonitoringContract = lazy(() => import('./components/Analytics/Contract/Contract'));
// const BlockMonitoringEvent = lazy(() => import('./components/Analytics/Event/Event'));
// const BlockMonitoringSyncBlock = lazy(() => import('./components/Analytics/SyncBlocks/SyncBlocks'));
// const BlockMonitoringEventLogs = lazy(() => import('./components/Analytics/EventLogs/EventLogs'));

// function App() {
//   const [activeTab, setActiveTab] = useState('dashboard');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'bridge':
//         return <BridgeStatus onBack={() => setActiveTab('dashboard')} />;
//       case 'analytics-overview':
//         return <BlockMonitoringOverview />;
//       case 'analytics-network':
//         return <BlockMonitoringNetwork />;
//       case 'analytics-contract':
//         return <BlockMonitoringContract />;
//       case 'analytics-event':
//         return <BlockMonitoringEvent />;
//       case 'analytics-sync-blocks':
//         return <BlockMonitoringSyncBlock />;
//       case 'analytics-event-logs':
//         return <BlockMonitoringEventLogs />;
//       default:
//         return (
//           <div className="placeholder-view">
//             <h2>Coming Soon</h2>
//             <p>We are still building the {activeTab} experience.</p>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="App">
//       {/* Sidebar stays fixed on the left */}
//       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
//       {/* Main content fills the rest and scrolls */}
//       <main className="main-content">
//         <Suspense
//           fallback={
//             <div className="loading-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
//               <RefreshCw />
//               <p>Loading view...</p>
//             </div>
//           }
//         >
//           {renderContent()}
//         </Suspense>
//       </main>
//     </div>
//   );
// }

// export default App;