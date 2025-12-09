import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Database } from 'lucide-react';
import { fetchAllBridgeStatuses } from '../../services/bridgeStatusService';
import '../Dashboard/BridgeDashboard.css';

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
    const refreshInterval = parseInt(import.meta.env.VITE_BRIDGE_STATUS_REFRESH_INTERVAL) || 30000;
    const interval = setInterval(fetchStatus, refreshInterval);
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
    const badgeStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
    
    if (isPaused === null) {
      return <span style={{ ...badgeStyle, background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' }}>Unknown</span>;
    }
    return isPaused ? (
      <span style={{ ...badgeStyle, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>Paused</span>
    ) : (
      <span style={{ ...badgeStyle, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Active</span>
    );
  };

  const AvailabilityBadge = ({ isEnabled }) => {
    const badgeStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    };
    
    if (isEnabled === null) {
      return <span style={{ ...badgeStyle, background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' }}>Unknown</span>;
    }
    return isEnabled ? (
      <span style={{ ...badgeStyle, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Available</span>
    ) : (
      <span style={{ ...badgeStyle, background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>Unavailable</span>
    );
  };

  return (
    <div className="bridge-dashboard">
      <div className="bridge-container">
        {/* Header */}
        <div className="bridge-header">
          <div className="bridge-header-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <Database size={24} color="#60a5fa" style={{ opacity: 0.7 }} />
              </div>

              <div>
                <h1>Bridge Status Monitor</h1>
                <p>Real-time bridge availability and token status</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <button
              className={`refresh-button ${isLoading ? 'loading' : ''}`}
              onClick={fetchStatus}
              disabled={isLoading}
            >
              <RefreshCw size={14} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            {lastUpdated && (
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {isLoading && !statusData ? (
          <div className="loading-state">
            <RefreshCw size={32} />
            <p>Loading bridge status...</p>
          </div>
        ) : (
        <div>
          {/* Status Summary */}
          <div className="bridge-card" style={{ marginBottom: '2rem' }}>
            <div className="bridge-card-header">
              <span className="bridge-card-title">📊 Status Summary</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>Aleo Bridge</h4>
                <p style={{ margin: 0 }}>
                  {statusData?.bridgeSettings?.isPaused ? (
                    <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <XCircle size={16} /> Paused
                    </span>
                  ) : (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={16} /> Active
                    </span>
                  )}
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>ETH Bridge</h4>
                <p style={{ margin: 0 }}>
                  {statusData?.ethBridgeStatus?.isPaused ? (
                    <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <XCircle size={16} /> Paused
                    </span>
                  ) : (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={16} /> Active
                    </span>
                  )}
                </p>
              </div>
               <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>BSC Bridge</h4>
                <p style={{ margin: 0 }}>
                  {statusData?.bscTokenStatus?.isPaused ? (
                    <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <XCircle size={16} /> Paused
                    </span>
                  ) : (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle size={16} /> Active
                    </span>
                  )}
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>Tokens on Aleo</h4>
                <p style={{ margin: 0 }}>
                  {statusData?.aleoTokenStatus &&
                  !statusData.aleoTokenStatus.error ? (
                    <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
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
                    <span style={{ color: '#64748b' }}>N/A</span>
                  )}
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>Tokens on ETH</h4>
                <p style={{ margin: 0 }}>
                  {statusData?.ethTokenAvailability &&
                  !statusData.ethTokenAvailability.error ? (
                    <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
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
                    <span style={{ color: '#64748b' }}>N/A</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Bridge Settings Section */}
          <div className="bridge-card" style={{ marginBottom: '2rem' }}>
            <div className="bridge-card-header">
              <span className="bridge-card-title">🌉 Bridge Settings</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {[
                { id: 'aleo', label: 'Aleo Bridge', data: statusData?.bridgeSettings },
                { id: 'eth', label: 'ETH Bridge', data: statusData?.ethBridgeStatus },
                { id: 'bsc', label: 'BSC Bridge', data: statusData?.bscBridgeStatus },
              ].map(({ id, label, data }) => (
                <div key={id} style={{ 
                  padding: '1rem', 
                  background: 'rgba(15, 23, 42, 0.5)', 
                  borderRadius: '0.5rem',
                  border: '1px solid #1e293b',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {data ? (
                        <>
                          <StatusIcon isPaused={data.isPaused} />
                          <StatusBadge isPaused={data.isPaused} />
                        </>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>No data</span>
                      )}
                    </div>
                  </div>
                  {data?.error && <div style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '0.5rem' }}>{data.error}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Token Status Section */}
          <div className="bridge-card" style={{ marginBottom: '2rem' }}>
            <div className="bridge-card-header">
              <span className="bridge-card-title">🪙 Token Availability</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: '#c084fc', marginBottom: '1rem', fontWeight: '600' }}>Token Availability on Aleo</h3>
                {statusData?.aleoTokenStatus &&
                !statusData.aleoTokenStatus.error &&
                Object.keys(statusData.aleoTokenStatus).length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(statusData.aleoTokenStatus)
                      .filter(([key]) => key !== 'error')
                      .map(([tokenName, tokenData]) => (
                        <div key={tokenName} style={{ 
                          background: 'rgba(15, 23, 42, 0.5)', 
                          padding: '1rem', 
                          borderRadius: '0.5rem',
                          border: '1px solid #1e293b'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.875rem', fontWeight: '600' }}>{tokenName}</h4>
                            <AvailabilityBadge isEnabled={tokenData.isPaused === null ? null : !tokenData.isPaused} />
                          </div>
                          {tokenData.tokenId && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                              Token ID: {tokenData.tokenId}
                            </div>
                          )}
                          {tokenData.error && (
                            <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem' }}>{tokenData.error}</div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                    No Aleo token status data available
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', color: '#60a5fa', marginBottom: '1rem', fontWeight: '600' }}>Token Availability on Ethereum</h3>
                {statusData?.ethTokenAvailability &&
                !statusData.ethTokenAvailability.error &&
                Object.keys(statusData.ethTokenAvailability).length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(statusData.ethTokenAvailability)
                      .filter(([key]) => key !== 'error')
                      .map(([tokenName, tokenData]) => (
                        <div key={tokenName} style={{ 
                          background: 'rgba(15, 23, 42, 0.5)', 
                          padding: '1rem', 
                          borderRadius: '0.5rem',
                          border: '1px solid #1e293b'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h4 style={{ margin: 0, color: '#e2e8f0', fontSize: '0.875rem', fontWeight: '600' }}>{tokenName}</h4>
                            <AvailabilityBadge isEnabled={tokenData.isEnabled} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            {tokenData.tokenAddress}
                          </div>
                          {tokenData.error && (
                            <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.5rem' }}>{tokenData.error}</div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                    No ETH token availability data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default BridgeStatus;
