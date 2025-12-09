import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Droplets } from 'lucide-react';
import useBridgeData from '../../hooks/useBridgeData';
import './BridgeDashboard.css';

const Dashboard = () => {
  const { data, formattedData, health, isLoading, hasError, refetch } = useBridgeData();
  const [displayError, setDisplayError] = useState(null);

  // Debug log
  useEffect(() => {
    console.log('📱 Dashboard state:', {
      data,
      formattedData,
      health,
      isLoading,
      hasError,
    });
  }, [data, formattedData, health, isLoading]);

  useEffect(() => {
    if (hasError) {
      setDisplayError('Failed to fetch bridge data. Retrying...');
      const errorDisplayDuration = parseInt(import.meta.env.VITE_ERROR_DISPLAY_DURATION) || 5000;
      const timer = setTimeout(() => setDisplayError(null), errorDisplayDuration);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  // Parse numeric values from formatted data
  const parseAmount = (value) => {
    if (!value || value === 'N/A') return 0;
    // Remove commas and parse as float
    return parseFloat(value.toString().replace(/,/g, ''));
  };

  // Build bridges array from real data
  const bridges = [
    {
      id: 'eth-aleo',
      source: {
        name: 'Ethereum',
        networkId: 'ETH',
        status: health?.ethereum?.status === 'online' ? 'Online' : 'Offline',
        theme: 'blue',
        logo: 'ETH',
        assets: [
          { symbol: 'USDC', amount: parseAmount(formattedData?.ethereum?.USDC) },
          { symbol: 'USDT', amount: parseAmount(formattedData?.ethereum?.USDT) },
          { symbol: 'ETH', amount: parseAmount(formattedData?.ethereum?.ETH) }
        ]
      },
      destination: {
        name: 'Aleo Network',
        networkId: 'ALEO',
        status: health?.aleo?.status === 'online' ? 'Online' : 'Offline',
        theme: 'purple',
        logo: 'ALEO',
        assets: [
          { symbol: 'vUSDC', amount: parseAmount(formattedData?.aleo?.vUSDC) },
          { symbol: 'vUSDT', amount: parseAmount(formattedData?.aleo?.vUSDT) },
          { symbol: 'vETH', amount: parseAmount(formattedData?.aleo?.vETH) }
        ]
      },
      updated: data?.ethereum?.timestamp ? new Date(data.ethereum.timestamp).toLocaleTimeString() : 'N/A'
    },
    {
      id: 'aleo-bsc',
      source: {
        name: 'Aleo Network',
        networkId: 'ALEO',
        status: health?.aleo?.status === 'online' ? 'Online' : 'Offline',
        theme: 'purple',
        logo: 'ALEO',
        assets: [
          { symbol: 'ALEO LOCKED', amount: parseAmount(formattedData?.aleoVlink?.supply) }
        ]
      },
      destination: {
        name: 'BSC Network',
        networkId: 'BSC',
        status: health?.bsc?.status === 'online' ? 'Online' : 'Offline',
        theme: 'yellow',
        logo: 'BSC',
        assets: [
          { symbol: 'MINTED BSC', amount: parseAmount(formattedData?.bsc?.data) }
        ]
      },
      updated: data?.bsc?.timestamp ? new Date(data.bsc.timestamp).toLocaleTimeString() : 'N/A'
    }
  ];

  return (
    <div className="bridge-dashboard">
      <div className="bridge-container">
        
        {/* Header */}
        <div className="bridge-header">
          <div className="bridge-header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                background: 'rgba(139, 92, 246, 0.1)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <Droplets size={24} color="#a78bfa" style={{ opacity: 0.7 }} />
              </div>
              <div>
                <h1>Bridge Liquidity Monitor</h1>
                <p>Real-time solvency and network status check</p>
              </div>
            </div>
          </div>
          <button 
            className={`refresh-button ${isLoading ? 'loading' : ''}`}
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw size={14} /> 
            {isLoading ? 'Refreshing...' : 'Auto-refreshing'}
          </button>
        </div>

        {/* Error Banner */}
        {displayError && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !formattedData && (
          <div className="loading-state">
            <RefreshCw size={32} />
            <p>Loading bridge data...</p>
          </div>
        )}

        {/* Bridge Cards Loop */}
        {!isLoading || formattedData ? (
          bridges.map((bridge) => (
            <BridgeCard key={bridge.id} data={bridge} />
          ))
        ) : null}

      </div>
    </div>
  );
};

// --- Sub-Components ---

const BridgeCard = ({ data }) => {
  return (
    <div className="bridge-card">
      
      {/* Card Header / Status Bar */}
      <div className="bridge-card-header">
        <div>
          <span className="bridge-card-title">
            {data.source.networkId} <span className="bridge-arrow-separator">→</span> {data.destination.networkId}
          </span>
        </div>
        <div className="bridge-card-timestamp">
          <span>Last updated: {data.updated}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="bridge-content-grid">
        
        {/* Source Network */}
        <NetworkColumn network={data.source} align="left" />

        {/* Center Connector (The Bridge) */}
        <div className="bridge-connector">
          <div className="bridge-pipe-container">
            <div className="bridge-pipe">
              <div className="bridge-flow" />
            </div>
          </div>
          <div className="bridge-arrow-icon">
            <ArrowRight size={16} />
          </div>
        </div>

        {/* Destination Network */}
        <NetworkColumn network={data.destination} align="right" />

      </div>
      
      {/* Solvency / Delta Footer */}
      <div className="solvency-footer">
        <div className="solvency-pairs">
          {data.source.assets.map((asset) => {
            // Find the matching destination asset by symbol
            const destAsset = data.destination.assets.find(a => a.symbol === asset.symbol);
            if (!destAsset) {
              // Optionally, display a warning or skip this asset
              return (
                <div key={asset.symbol} className="solvency-pair unmatched">
                  <span className="solvency-label">{asset.symbol} Pair</span>
                  <div className="solvency-bar-container">
                    <div className="solvency-bar-left" />
                    <div className="solvency-bar-right unmatched" />
                  </div>
                  <div className="solvency-delta unmatched">
                    <AlertCircle size={12} />
                    <span>Missing destination asset</span>
                  </div>
                </div>
              );
            }
            
            const isEthToAleo = data.source.networkId === 'ETH';
            const diff = asset.amount - destAsset.amount; 
              
            // Directional solvency check
            const isMatched = isEthToAleo
              ? diff >= -1.0 // ETH→Aleo: source should exceed destination
              : (destAsset.amount - asset.amount) >= -1.0; // Other: destination should exceed source (example logic)
            
            return (
              <div key={asset.symbol} className="solvency-pair">
                <span className="solvency-label">{asset.symbol} Pair</span>
                
                {/* Visual Solvency Bar */}
                <div className="solvency-bar-container">
                  <div className="solvency-bar-left" />
                  <div className={`solvency-bar-right ${isMatched ? 'matched' : 'unmatched'}`} />
                </div>

                <div className={`solvency-delta ${isMatched ? 'matched' : 'unmatched'}`}>
                  {isMatched ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                  <span>{diff > 0 ? '+' : ''}{diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

const NetworkColumn = ({ network, align }) => {
  // Theme map for dynamic colors
  const themeClass = network.theme ? `theme-${network.theme}` : '';
  
  // Network SVG logos
  const logos = {
    'ALEO': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzYiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA3NiA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQ3Ljg4NiAwSDI5LjQ2MDFMMTMuNDY3OSA0Ni43NzA0SDIzLjIwNjhMMzYuMTYwOSA4LjYxNDgxSDQwLjg1MTNMNTMuODAzNiA0Ni43NzA0SDIzLjIwNjhMMjAuMTkzIDU1LjM4NTJINTYuNzA3M0w2NS4wODExIDgwSDc1LjEzMTRMNDcuODg2IDBaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yLjEwMjc4IDgwSDExLjgxNzRMMjAuMTkzIDU1LjM4NTJMMTAuNTIxMyA1NS4zODUyTDIuMTAyNzggODBaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zLjgxNDgyIDQ2Ljc3MDRMMC44NjgxNjQgNTUuMzg1MkgxMC41MjEzTDEzLjQ2NzkgNDYuNzcwNEgzLjgxNDgyWiIgZmlsbD0iI0Y1RjVGNSIvPgo8L3N2Zz4K',
    'ETH': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExLjk5OTggMTIuODc1TDYuNDk5ODUgOS44NzVMMTEuOTk5OCAyLjI1TDE3LjQ5OTggOS44NzVMMTEuOTk5OCAxMi44NzVaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMS45OTk4IDIxLjc1TDYuNDk5ODUgMTAuODc1TDExLjk5OTggMTMuODc1TDE3LjQ5OTggMTAuODc1TDExLjk5OTggMjEuNzVaIiBmaWxsPSIjRjVGNUY1IiBvcGFjaXR5PSIwLjYiLz4KPC9zdmc+',
    'BSC': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDRMOC41IDcuNUwxMiAxMUwxNS41IDcuNUwxMiA0WiIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNNCAxMkw3LjUgOC41TDExIDEyTDcuNSAxNS41TDQgMTJaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAxMkwxNi41IDguNUwxMyAxMkwxNi41IDE1LjVMMjAgMTJaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMiAyMEw4LjUgMTYuNUwxMiAxM0wxNS41IDE2LjVMMTIgMjBaIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMiA4LjVMMTAuMjUgMTBMMTIgMTEuNzVMMTMuNzUgMTBMMTIgOC41WiIgZmlsbD0iI0Y1RjVGNSIgb3BhY2l0eT0iMC42Ii8+CjxwYXRoIGQ9Ik0xMiAxNS41TDEwLjI1IDE0TDEyIDEyLjI1TDEzLjc1IDE0TDEyIDE1LjVaIiBmaWxsPSIjRjVGNUY1IiBvcGFjaXR5PSIwLjYiLz4KPC9zdmc+'
  };

  return (
    <div className={`network-column align-${align}`}>
      
      {/* Network Badge */}
      <div className={`network-badge ${themeClass}`}>
        {network.logo ? (
          logos[network.logo] ? (
            <img src={logos[network.logo]} alt={network.name} style={{ width: '16px', height: '16px' }} />
          ) : (
            <span style={{ fontSize: '1.2em' }}>{network.logo}</span>
          )
        ) : (
          <div className="status-indicator">
            {network.status === 'Online' && (
              <span className="status-ping"></span>
            )}
            <span className="status-dot"></span>
          </div>
        )}
        <span>{network.name}</span>
      </div>

      {/* Asset List */}
      <div className="asset-list">
        {network.assets.map((asset) => (
          <div key={asset.symbol} className="asset-item">
            <span className="asset-label">
              {asset.symbol}
            </span>
            <div className="asset-amount">
              {asset.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              
              {/* Hover to see full precision (Tooltip concept) */}
              <div className="asset-tooltip">
                {asset.amount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;