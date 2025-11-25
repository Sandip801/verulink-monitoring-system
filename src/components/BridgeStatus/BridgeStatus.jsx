import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { fetchAllBridgeStatuses } from '../../services/bridgeStatusService';
import './BridgeStatus.css';

const BridgeStatus = ({ onBack }) => {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllBridgeStatuses();
      setStatusData(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch bridge status');
      console.error('Error fetching bridge status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatusIcon = ({ isPaused }) => {
    if (isPaused === null) {
      return <AlertCircle size={20} className="icon-warning" />;
    }
    return isPaused ? (
      <XCircle size={20} className="icon-error" />
    ) : (
      <CheckCircle size={20} className="icon-success" />
    );
  };

  const StatusBadge = ({ isPaused }) => {
    if (isPaused === null) {
      return <span className="status-badge status-unknown">Unknown</span>;
    }
    return isPaused ? (
      <span className="status-badge status-paused">Paused</span>
    ) : (
      <span className="status-badge status-active">Active</span>
    );
  };

  return (
    <div className="bridge-status-page">
      {/* Header */}
      <div className="bridge-status-header">
        <div className="header-top">
          <button className="back-btn" onClick={onBack} title="Go back">
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1>Bridge Status Monitor</h1>
          <button
            className={`refresh-btn ${isLoading ? 'loading' : ''}`}
            onClick={fetchStatus}
            disabled={isLoading}
            title="Refresh status"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
        {lastUpdated && (
          <p className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !statusData ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bridge status...</p>
        </div>
      ) : (
        <div className="status-container">
          {/* Bridge Settings Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">🌉</span>
              Aleo Bridge Settings
            </h2>
            {statusData?.bridgeSettings ? (
              <div className="status-card">
                <div className="status-row">
                  <div className="status-label">
                    <span>Bridge Status</span>
                  </div>
                  <div className="status-value">
                    <StatusIcon isPaused={statusData.bridgeSettings.isPaused} />
                    <StatusBadge isPaused={statusData.bridgeSettings.isPaused} />
                  </div>
                </div>
                {statusData.bridgeSettings.error && (
                  <div className="error-text">{statusData.bridgeSettings.error}</div>
                )}
              </div>
            ) : (
              <div className="status-card">
                <p className="no-data">No bridge settings data available</p>
              </div>
            )}
          </div>

          {/* ETH Token Status Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">🔴</span>
              ETH Token Status
            </h2>
            <div className="status-grid">
              {statusData?.ethTokenStatus && !statusData.ethTokenStatus.error ? (
                Object.entries(statusData.ethTokenStatus).map(([tokenName, tokenData]) => (
                  <div key={tokenName} className="status-card">
                    <div className="card-header">
                      <h3>{tokenName}</h3>
                      <StatusIcon isPaused={tokenData.isPaused} />
                    </div>
                    <div className="card-body">
                      <div className="status-row">
                        <span className="label">Status:</span>
                        <StatusBadge isPaused={tokenData.isPaused} />
                      </div>
                      {tokenData.error && (
                        <div className="error-text">{tokenData.error}</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="status-card">
                  <p className="no-data">No ETH token status data available</p>
                </div>
              )}
            </div>
          </div>

          {/* BSC Token Status Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">🟡</span>
              BSC Token Status (vLink)
            </h2>
            {statusData?.bscTokenStatus ? (
              <div className="status-card">
                <div className="card-header">
                  <h3>vLink Token</h3>
                  <StatusIcon isPaused={statusData.bscTokenStatus.isPaused} />
                </div>
                <div className="card-body">
                  <div className="status-row">
                    <span className="label">Status:</span>
                    <StatusBadge isPaused={statusData.bscTokenStatus.isPaused} />
                  </div>
                  {statusData.bscTokenStatus.error && (
                    <div className="error-text">{statusData.bscTokenStatus.error}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="status-card">
                <p className="no-data">No BSC token status data available</p>
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">📊</span>
              Status Summary
            </h2>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>Overall Bridge Status</h4>
                <p className="summary-value">
                  {statusData?.bridgeSettings?.isPaused ? (
                    <span className="badge-error">⚠️ Paused</span>
                  ) : (
                    <span className="badge-success">✅ Active</span>
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h4>ETH Tokens</h4>
                <p className="summary-value">
                  {statusData?.ethTokenStatus &&
                  !statusData.ethTokenStatus.error ? (
                    <span className="count">
                      {Object.values(statusData.ethTokenStatus).filter(
                        (t) => !t.error && !t.isPaused
                      ).length}/
                      {Object.entries(statusData.ethTokenStatus).filter(
                        ([_, v]) => !v.error
                      ).length}{' '}
                      Active
                    </span>
                  ) : (
                    <span className="count-error">N/A</span>
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h4>BSC vLink Token</h4>
                <p className="summary-value">
                  {statusData?.bscTokenStatus?.isPaused ? (
                    <span className="badge-error">⚠️ Paused</span>
                  ) : (
                    <span className="badge-success">✅ Active</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgeStatus;
