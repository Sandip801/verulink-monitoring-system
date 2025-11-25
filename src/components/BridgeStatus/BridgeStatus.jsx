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

  const AvailabilityBadge = ({ isEnabled }) => {
    if (isEnabled === null) {
      return <span className="status-badge status-unknown">Unknown</span>;
    }
    return isEnabled ? (
      <span className="status-badge status-active">Available</span>
    ) : (
      <span className="status-badge status-paused">Unavailable</span>
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
          {/* Status Summary */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">📊</span>
              Status Summary
            </h2>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>Aleo Bridge</h4>
                <p className="summary-value">
                  {statusData?.bridgeSettings?.isPaused ? (
                    <span className="badge-error">⚠️ Paused</span>
                  ) : (
                    <span className="badge-success">✅ Active</span>
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h4>ETH Bridge</h4>
                <p className="summary-value">
                  {statusData?.ethBridgeStatus?.isPaused ? (
                    <span className="badge-error">⚠️ Paused</span>
                  ) : (
                    <span className="badge-success">✅ Active</span>
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h4>Aleo Tokens</h4>
                <p className="summary-value">
                  {statusData?.aleoTokenStatus &&
                  !statusData.aleoTokenStatus.error ? (
                    <span className="count">
                      {Object.entries(statusData.aleoTokenStatus).filter(
                        ([key, value]) => key !== 'error' && value && value.isPaused === false
                      ).length}
                      /
                      {Object.entries(statusData.aleoTokenStatus).filter(
                        ([key, value]) =>
                          key !== 'error' && value && value.isPaused !== null && !value.error
                      ).length}{' '}
                      Active
                    </span>
                  ) : (
                    <span className="count-error">N/A</span>
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h4>ETH Tokens</h4>
                <p className="summary-value">
                  {statusData?.ethTokenAvailability &&
                  !statusData.ethTokenAvailability.error ? (
                    <span className="count">
                      {Object.entries(statusData.ethTokenAvailability).filter(
                        ([key, value]) => key !== 'error' && value && value.isEnabled
                      ).length}
                      /
                      {Object.entries(statusData.ethTokenAvailability).filter(
                        ([key, value]) =>
                          key !== 'error' && value && value.isEnabled !== null && !value.error
                      ).length}{' '}
                      Available
                    </span>
                  ) : (
                    <span className="count-error">N/A</span>
                  )}
                </p>
              </div>
              <div className="summary-card">
                <h4>BSC Bridge</h4>
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

          {/* Bridge Settings Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">🌉</span>
              Bridge Settings
            </h2>
            <div className="status-card">
              {[
                { id: 'aleo', label: 'Aleo Bridge', data: statusData?.bridgeSettings },
                { id: 'eth', label: 'ETH Bridge', data: statusData?.ethBridgeStatus },
              ].map(({ id, label, data }) => (
                <div key={id} className="bridge-status-block">
                  <div className="status-row">
                    <div className="status-label">
                      <span>{label}</span>
                    </div>
                    <div className="status-value">
                      {data ? (
                        <>
                          <StatusIcon isPaused={data.isPaused} />
                          <StatusBadge isPaused={data.isPaused} />
                        </>
                      ) : (
                        <span className="status-badge status-unknown">No data</span>
                      )}
                    </div>
                  </div>
                  {data?.error && <div className="error-text">{data.error}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Token Status Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">🪙</span>
              Token Availability
            </h2>
            <div className="status-grid token-status-grid">
              <div className="token-status-column">
                <h3 className="token-column-title">Aleo Token Availability</h3>
                {statusData?.aleoTokenStatus &&
                !statusData.aleoTokenStatus.error &&
                Object.keys(statusData.aleoTokenStatus).length ? (
                  Object.entries(statusData.aleoTokenStatus)
                    .filter(([key]) => key !== 'error')
                    .map(([tokenName, tokenData]) => (
                      <div key={tokenName} className="status-card">
                        <div className="card-header">
                          <h3>{tokenName}</h3>
                          <AvailabilityBadge isEnabled={tokenData.isPaused === null ? null : !tokenData.isPaused} />
                        </div>
                        <div className="card-body">
                          <div className="status-row">
                            <span className="label">Availability:</span>
                            <AvailabilityBadge isEnabled={tokenData.isPaused === null ? null : !tokenData.isPaused} />
                          </div>
                          {tokenData.tokenId && (
                            <div className="status-row">
                              <span className="label">Token ID:</span>
                              <span className="token-address">{tokenData.tokenId}</span>
                            </div>
                          )}
                          {tokenData.error && (
                            <div className="error-text">{tokenData.error}</div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="status-card">
                    <p className="no-data">No Aleo token status data available</p>
                  </div>
                )}
              </div>
              <div className="token-status-column">
                <h3 className="token-column-title">ETH Token Availability</h3>
                {statusData?.ethTokenAvailability &&
                !statusData.ethTokenAvailability.error &&
                Object.keys(statusData.ethTokenAvailability).length ? (
                  Object.entries(statusData.ethTokenAvailability)
                    .filter(([key]) => key !== 'error')
                    .map(([tokenName, tokenData]) => (
                      <div key={tokenName} className="status-card">
                        <div className="card-header">
                          <h3>{tokenName}</h3>
                          <AvailabilityBadge isEnabled={tokenData.isEnabled} />
                        </div>
                        <div className="card-body">
                          <div className="status-row">
                            <span className="label">Availability:</span>
                            <AvailabilityBadge isEnabled={tokenData.isEnabled} />
                          </div>
                          <div className="status-row">
                            <span className="label">Token Address:</span>
                            <span className="token-address">{tokenData.tokenAddress}</span>
                          </div>
                          {tokenData.error && (
                            <div className="error-text">{tokenData.error}</div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="status-card">
                    <p className="no-data">No ETH token availability data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BSC Token Status Section */}
          <div className="status-section">
            <h2 className="section-title">
              <span className="section-icon">🟡</span>
              BSC Bridge Status
            </h2>
            {statusData?.bscTokenStatus || statusData?.bscBridgeStatus ? (
              <div className="status-card">
                <div className="card-header">
                  <h3>vLink Token</h3>
                  <StatusIcon isPaused={statusData?.bscBridgeStatus?.isPaused ?? statusData?.bscTokenStatus?.isPaused ?? null} />
                </div>
                <div className="card-body">
                  <div className="status-row">
                    <span className="label">On-Chain Bridge Status:</span>
                    <StatusBadge isPaused={statusData?.bscBridgeStatus?.isPaused ?? null} />
                  </div>
                  <div className="status-row">
                    <span className="label">Aleo Mapping Status:</span>
                    <StatusBadge isPaused={statusData?.bscTokenStatus?.isPaused ?? null} />
                  </div>
                  {statusData?.bscBridgeStatus?.error && (
                    <div className="error-text">{statusData.bscBridgeStatus.error}</div>
                  )}
                  {statusData?.bscTokenStatus?.error && (
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
        </div>
      )}
    </div>
  );
};

export default BridgeStatus;
