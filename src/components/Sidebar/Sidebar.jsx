import React, { useState, useEffect } from 'react';
import { Activity, Database, TrendingUp, AlertTriangle, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const isAnalyticsActive = activeTab.startsWith('analytics-');
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(isAnalyticsActive);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false); // Close mobile menu when item is clicked
  };

  const handleNavItemClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false); // Close mobile menu when item is clicked
  };

  // Auto-expand analytics when a subtab becomes active
  useEffect(() => {
    if (isAnalyticsActive && !isAnalyticsExpanded) {
      setIsAnalyticsExpanded(true);
    }
  }, [activeTab, isAnalyticsExpanded]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.sidebar') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Toggle Button - Only visible on mobile when sidebar is closed */}
      <button 
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'mobile-menu-toggle--hidden' : ''}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}

      <div className={`sidebar ${isMobileMenuOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="sidebar-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="sidebar-title">Bridge Monitoring Dashboard</div>
        <div className="sidebar-subtitle">Real-time monitoring of multi-chain bridge status</div>
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
              onClick={() => handleNavItemClick(id)}
              className={`nav-item ${activeTab === id ? 'nav-item--active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
    </>
  );
};

export default Sidebar;