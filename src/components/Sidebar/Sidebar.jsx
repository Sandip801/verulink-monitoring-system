import React, { useState, useEffect } from 'react';
import { Activity, Database, TrendingUp, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const isAnalyticsActive = activeTab.startsWith('analytics-');
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(isAnalyticsActive);

  const menuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'bridge', icon: Database, label: 'Bridge Status' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', hasSubTabs: true },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' }
  ];

  const analyticsSubTabs = [
    { id: 'analytics-overview', label: 'Overview' },
    { id: 'analytics-network', label: 'Network' },
    { id: 'analytics-contract', label: 'Contract' },
    { id: 'analytics-event', label: 'Event' },
    { id: 'analytics-sync-blocks', label: 'Sync Blocks' },
    { id: 'analytics-event-logs', label: 'Event Logs' }
  ];

  const handleAnalyticsClick = () => {
    setIsAnalyticsExpanded(!isAnalyticsExpanded);
  };

  const handleSubTabClick = (subTabId) => {
    setActiveTab(subTabId);
  };

  // Auto-expand analytics when a subtab becomes active
  useEffect(() => {
    if (isAnalyticsActive && !isAnalyticsExpanded) {
      setIsAnalyticsExpanded(true);
    }
  }, [activeTab, isAnalyticsExpanded]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">BRIDGE SMART</div>
        <div className="sidebar-subtitle">MONITORING</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(({ id, icon: Icon, label, hasSubTabs }) => {
          if (id === 'analytics' && hasSubTabs) {
            return (
              <div key={id} className="nav-item-group">
                <button
                  onClick={handleAnalyticsClick}
                  className={`nav-item ${isAnalyticsActive ? 'nav-item--active' : ''}`}
                >
                  <Icon size={20} className="nav-icon" />
                  <span className="nav-label">{label}</span>
                  {isAnalyticsExpanded ? (
                    <ChevronDown size={16} className="nav-chevron" />
                  ) : (
                    <ChevronRight size={16} className="nav-chevron" />
                  )}
                </button>
                {isAnalyticsExpanded && (
                  <div className="nav-subtabs">
                    {analyticsSubTabs.map((subTab) => (
                      <button
                        key={subTab.id}
                        onClick={() => handleSubTabClick(subTab.id)}
                        className={`nav-subtab ${activeTab === subTab.id ? 'nav-subtab--active' : ''}`}
                      >
                        <span className="nav-subtab-label">{subTab.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-item ${activeTab === id ? 'nav-item--active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;