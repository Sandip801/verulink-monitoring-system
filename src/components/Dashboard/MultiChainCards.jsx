import React from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import './MultiChainCards.css';

const MultiChainCards = ({ data, formattedData, isLoading }) => {
  return (
    <div className="chains-container">
      {/* Aleo Network Card */}
      <div className="chain-card">
        <div className="chain-header">
          <span className="chain-icon">🟣</span>
          <h3>Aleo Network</h3>
          <span className={`status-badge ${data?.aleo?.status || 'offline'}`}>
            {data?.aleo?.status === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="chain-content">
          {isLoading ? (
            <div className="loading-state">
              <Loader size={24} className="spinning" />
              <span>Fetching data...</span>
            </div>
          ) : (
            <div className="tokens-grid">
              {/* vUSDC */}
              <div className="token-item">
                <div className="token-label">vUSDC</div>
                <div className="token-value">
                  {formattedData?.aleo?.vUSDC || 'N/A'}
                </div>
                <div className="token-decimals">6 decimals</div>
              </div>

              {/* vETH */}
              <div className="token-item">
                <div className="token-label">vETH</div>
                <div className="token-value">
                  {formattedData?.aleo?.vETH || 'N/A'}
                </div>
                <div className="token-decimals">18 decimals</div>
              </div>

              {/* vUSDT */}
              <div className="token-item">
                <div className="token-label">vUSDT</div>
                <div className="token-value">
                  {formattedData?.aleo?.vUSDT || 'N/A'}
                </div>
                <div className="token-decimals">6 decimals</div>
              </div>
            </div>
          )}
        </div>

        {data?.aleo?.timestamp && (
          <div className="chain-footer">
            Updated: {new Date(data.aleo.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Ethereum Network Card */}
      <div className="chain-card">
        <div className="chain-header">
          <span className="chain-icon">🔴</span>
          <h3>Ethereum Network</h3>
          <span className={`status-badge ${data?.ethereum?.status || 'offline'}`}>
            {data?.ethereum?.status === 'online' ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="chain-content">
          {isLoading ? (
            <div className="loading-state">
              <Loader size={24} className="spinning" />
              <span>Fetching data...</span>
            </div>
          ) : (
            <div className="tokens-grid">
              {/* USDC */}
              <div className="token-item">
                <div className="token-label">USDC</div>
                <div className="token-value">
                  {formattedData?.ethereum?.USDC || 'N/A'}
                </div>
                <div className="token-decimals">6 decimals</div>
              </div>

              {/* USDT */}
              <div className="token-item">
                <div className="token-label">USDT</div>
                <div className="token-value">
                  {formattedData?.ethereum?.USDT || 'N/A'}
                </div>
                <div className="token-decimals">6 decimals</div>
              </div>

              {/* ETH */}
              <div className="token-item">
                <div className="token-label">ETH</div>
                <div className="token-value">
                  {formattedData?.ethereum?.ETH || 'N/A'}
                </div>
                <div className="token-decimals">18 decimals</div>
              </div>
            </div>
          )}
        </div>

        {data?.ethereum?.timestamp && (
          <div className="chain-footer">
            Updated: {new Date(data.ethereum.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* BSC Network Card */}
      <div className="chain-card">
        <div className="chain-header">
          <span className="chain-icon">🟡</span>
          <h3>BSC Network</h3>
          <span className={`status-badge ${data?.bsc?.status || 'offline'}`}>
            {data?.bsc?.status === 'online' ? 'Online' : 'Not Configured'}
          </span>
        </div>

        <div className="chain-content">
          {isLoading ? (
            <div className="loading-state">
              <Loader size={24} className="spinning" />
              <span>Fetching data...</span>
            </div>
          ) : data?.bsc?.status === 'not_configured' ? (
            <div className="empty-state">
              <AlertCircle size={24} />
              <span>Not configured</span>
            </div>
          ) : (
            <div className="tokens-grid">
              <div className="token-item">
                <div className="token-label">Total Supply</div>
                <div className="token-value">
                  {formattedData?.bsc?.data || 'N/A'}
                </div>
                <div className="token-decimals">6 decimals</div>
              </div>
            </div>
          )}
        </div>

        {data?.bsc?.timestamp && (
          <div className="chain-footer">
            Updated: {new Date(data.bsc.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiChainCards;
