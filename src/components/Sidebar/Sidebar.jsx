import React from 'react';
import { Activity, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'bridge', icon: Database, label: 'Bridge Status' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">BRIDGE SMART</div>
        <div className="sidebar-subtitle">MONITORING</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`nav-item ${activeTab === id ? 'nav-item--active' : ''}`}
          >
            <Icon size={20} className="nav-icon" />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;