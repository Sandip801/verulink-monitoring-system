import React, { useState, useEffect } from 'react';
import { Activity, Database, TrendingUp, AlertTriangle, ChevronDown, Menu, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const isAnalyticsActive = activeTab.startsWith('analytics-');
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState(false);
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
    if (isAnalyticsExpanded) {
      setIsAnalyticsExpanded(false);
    } else {
      setIsAnalyticsExpanded(true);
    }
  };

  const handleSubTabClick = (subTabId) => {
    setActiveTab(subTabId);
    setIsAnalyticsExpanded(false);
    setIsMobileMenuOpen(false);
  };

  const handleNavItemClick = (id) => {
    if (id === 'analytics') {
      handleAnalyticsClick();
    } else {
      setActiveTab(id);
      setIsAnalyticsExpanded(false);
      setIsMobileMenuOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.header-nav')) {
        setIsAnalyticsExpanded(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const headerStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    background: '#0f172a',
    borderBottom: '1px solid #1e293b',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
  };

  const containerStyle = {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem'
  };

  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const logoStyle = {
    height: '2rem',
    width: '2rem',
    display: 'flex',
    alignItems: 'center'
  };

  const titleStyle = {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.02em',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const navStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  };

  const navButtonStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    color: isActive ? '#60a5fa' : '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
  });

  const mobileMenuButtonStyle = {
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '0.5rem',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    minWidth: '12rem',
    zIndex: 100,
    overflow: 'hidden'
  };

  const dropdownItemStyle = (isActive) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    color: isActive ? '#60a5fa' : '#94a3b8',
    fontSize: '0.875rem',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s'
  });

  const mobileOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    zIndex: 40
  };

  const mobileMenuStyle = {
    position: 'fixed',
    top: '4rem',
    right: 0,
    bottom: 0,
    width: '16rem',
    background: '#0f172a',
    borderLeft: '1px solid #1e293b',
    padding: '1rem',
    overflowY: 'auto',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  return (
    <>
      <header style={headerStyle}>
        <div style={containerStyle}>
          {/* Brand */}
          <div style={brandStyle}>
            <img 
              src="https://bridge.verulink.com/favicon.ico" 
              alt="Verulink"
              style={logoStyle}
            />
            <span style={titleStyle}>Verulink Bridge Monitoring Dashboard</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav" style={{ ...navStyle, '@media (max-width: 768px)': { display: 'none' } }}>
            {menuItems.map(({ id, icon: Icon, label, hasSubTabs }) => {
              if (id === 'analytics' && hasSubTabs) {
                return (
                  <div key={id} style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyticsClick();
                      }}
                      style={navButtonStyle(isAnalyticsActive)}
                      onMouseEnter={(e) => e.currentTarget.style.background = isAnalyticsActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(51, 65, 85, 0.5)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = isAnalyticsActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                      <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: isAnalyticsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>
                    {isAnalyticsExpanded && (
                      <div style={dropdownStyle}>
                        {analyticsSubTabs.map((subTab) => (
                          <button
                            key={subTab.id}
                            onClick={() => handleSubTabClick(subTab.id)}
                            style={dropdownItemStyle(activeTab === subTab.id)}
                            onMouseEnter={(e) => e.currentTarget.style.background = activeTab === subTab.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(51, 65, 85, 0.5)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = activeTab === subTab.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                          >
                            {subTab.label}
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
                  style={navButtonStyle(activeTab === id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = activeTab === id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(51, 65, 85, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = activeTab === id ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            style={{ ...mobileMenuButtonStyle, '@media (max-width: 768px)': { display: 'flex' } }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div style={mobileOverlayStyle} onClick={() => setIsMobileMenuOpen(false)} />
          <div style={mobileMenuStyle}>
            {menuItems.map(({ id, icon: Icon, label, hasSubTabs }) => {
              if (id === 'analytics' && hasSubTabs) {
                return (
                  <div key={id}>
                    <button
                      onClick={() => handleAnalyticsClick()}
                      style={{
                        ...navButtonStyle(isAnalyticsActive),
                        width: '100%',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Icon size={18} />
                        <span>{label}</span>
                      </div>
                      <ChevronDown size={16} style={{ transform: isAnalyticsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </button>
                    {isAnalyticsExpanded && (
                      <div style={{ marginTop: '0.5rem', marginLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {analyticsSubTabs.map((subTab) => (
                          <button
                            key={subTab.id}
                            onClick={() => handleSubTabClick(subTab.id)}
                            style={{
                              ...navButtonStyle(activeTab === subTab.id),
                              width: '100%',
                              justifyContent: 'flex-start',
                              fontSize: '0.8125rem'
                            }}
                          >
                            {subTab.label}
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
                  style={{
                    ...navButtonStyle(activeTab === id),
                    width: '100%',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;