import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import useBridgeData from '../../hooks/useBridgeData';
import './Dashboard.css';

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
      const timer = setTimeout(() => setDisplayError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Bridge Monitoring Dashboard</h1>
          <p className="header-subtitle">Real-time monitoring of multi-chain bridge status</p>
        </div>
        <div className="header-buttons">
          <button
            className={`refresh-btn ${isLoading ? 'loading' : ''}`}
            onClick={refetch}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {displayError && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{displayError}</span>
        </div>
      )}

      {/* Multi-Chain Cards Section */}
      <div className="section">
        <h2 className="section-title">Multi-Chain Bridge Status</h2>
      </div>

      {/* ETH to Aleo Bridge Section */}
      <div className="section">
        <h2 className="section-title">ETH to Aleo Bridge</h2>
        <div className="bridge-chains">
          {/* Ethereum Network Card */}
          <div className="bridge-card">
            <div className="bridge-card-header">
              <span className="bridge-card-icon">🔴</span>
              <h3>Ethereum Network</h3>
              <span className={`status-badge online`}>
                Online
              </span>
            </div>
            <div className="bridge-card-content">
              {isLoading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                <div className="bridge-tokens">
                  <div className="bridge-token">
                    <span className="bridge-token-label">USDC</span>
                    <span className="bridge-token-value">{formattedData?.ethereum?.USDC || 'N/A'}</span>
                  </div>
                  <div className="bridge-token">
                    <span className="bridge-token-label">USDT</span>
                    <span className="bridge-token-value">{formattedData?.ethereum?.USDT || 'N/A'}</span>
                  </div>
                  <div className="bridge-token">
                    <span className="bridge-token-label">ETH</span>
                    <span className="bridge-token-value">{formattedData?.ethereum?.ETH || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
            {data?.ethereum?.timestamp && (
              <div className="bridge-card-footer">
                Updated: {new Date(data.ethereum.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Arrow Indicator */}
          <div className="bridge-arrow">
            <span>→</span>
          </div>

          {/* Aleo Network Card */}
          <div className="bridge-card">
            <div className="bridge-card-header">
              <span className="bridge-card-icon">🟣</span>
              <h3>Aleo Network</h3>
              <span className={`status-badge online`}>
                Online
              </span>
            </div>
            <div className="bridge-card-content">
              {isLoading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                <div className="bridge-tokens">
                  <div className="bridge-token">
                    <span className="bridge-token-label">vUSDC</span>
                    <span className="bridge-token-value">{formattedData?.aleo?.vUSDC || 'N/A'}</span>
                  </div>
                  <div className="bridge-token">
                    <span className="bridge-token-label">vUSDT</span>
                    <span className="bridge-token-value">{formattedData?.aleo?.vUSDT || 'N/A'}</span>
                  </div>
                  <div className="bridge-token">
                    <span className="bridge-token-label">vETH</span>
                    <span className="bridge-token-value">{formattedData?.aleo?.vETH || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
            {data?.aleo?.timestamp && (
              <div className="bridge-card-footer">
                Updated: {new Date(data.aleo.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aleo to BSC Bridge Section */}
      <div className="section">
        <h2 className="section-title">Aleo to BSC Bridge</h2>
        <div className="bridge-chains">
          {/* Aleo Network Card */}
          <div className="bridge-card">
            <div className="bridge-card-header">
              <span className="bridge-card-icon">🟣</span>
              <h3>Aleo Network</h3>
              <span className={`status-badge online`}>
                Online
              </span>
            </div>
            <div className="bridge-card-content">
              {isLoading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                <div className="bridge-tokens">
                  <div className="bridge-token">
                    <span className="bridge-token-label">ALEO LOCKED AMOUNT</span>
                    <span className="bridge-token-value">{formattedData?.aleoVlink?.supply || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
            {data?.aleoVlink?.timestamp && (
              <div className="bridge-card-footer">
                Updated: {new Date(data.aleoVlink.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Arrow Indicator */}
          <div className="bridge-arrow">
            <span>→</span>
          </div>

          {/* BSC Network Card */}
          <div className="bridge-card">
            <div className="bridge-card-header">
              <span className="bridge-card-icon">🟡</span>
              <h3>BSC Network</h3>
              <span className={`status-badge online`}>
                Online
              </span>
            </div>
            <div className="bridge-card-content">
              {isLoading ? (
                <div className="loading-text">Loading...</div>
              ) : (
                <div className="bridge-tokens">
                  <div className="bridge-token">
                    <span className="bridge-token-label">MINTED ON BSC</span>
                    <span className="bridge-token-value">{formattedData?.bsc?.data || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
            {data?.bsc?.timestamp && (
              <div className="bridge-card-footer">
                Updated: {new Date(data.bsc.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;