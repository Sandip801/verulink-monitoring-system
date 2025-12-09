import { useEffect, useState } from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, AlertCircle, Droplets } from 'lucide-react';
import useBridgeData from '../../hooks/useBridgeData';

import AleoIcon from '../../assets/icons/aleo.svg';

// Network Icons imported from SVG files
const NETWORK_ICONS = {
  'ALEO': AleoIcon,
  'BSC': 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=040',
  'ETH': "https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond-purple.svg?v=040"
};

const Dashboard = () => {
  const { data, formattedData, health, isLoading, hasError, refetch } = useBridgeData();
  const [displayError, setDisplayError] = useState(null);

  useEffect(() => {
    if (hasError) {
      setDisplayError('Failed to fetch bridge data. Retrying...');
      const timer = setTimeout(() => setDisplayError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  const parseAmount = (value) => {
    if (!value || value === 'N/A') return 0;
    return parseFloat(value.toString().replace(/,/g, ''));
  };

  const bridges = [
    {
      id: 'eth-aleo',
      updated: data?.ethereum?.timestamp ? new Date(data.ethereum.timestamp).toLocaleTimeString() : 'N/A',
      source: {
        name: 'Ethereum',
        id: 'ETH',
        theme: 'blue',
        lastSequence: data?.ethereum?.lastSequence || 'N/A',
        assets: [
          { symbol: 'USDC', amount: parseAmount(formattedData?.ethereum?.USDC) },
          { symbol: 'USDT', amount: parseAmount(formattedData?.ethereum?.USDT) },
          { symbol: 'ETH', amount: parseAmount(formattedData?.ethereum?.ETH) }
        ]
      },
      destination: {
        name: 'Aleo Network',
        id: 'ALEO',
        theme: 'purple',
        lastSequence: data?.aleo?.lastSequenceFromEth || 'N/A',
        assets: [
          { symbol: 'vUSDC', amount: parseAmount(formattedData?.aleo?.vUSDC) },
          { symbol: 'vUSDT', amount: parseAmount(formattedData?.aleo?.vUSDT) },
          { symbol: 'vETH', amount: parseAmount(formattedData?.aleo?.vETH) }
        ]
      }
    },
    {
      id: 'aleo-bsc',
      updated: data?.bsc?.timestamp ? new Date(data.bsc.timestamp).toLocaleTimeString() : 'N/A',
      source: {
        name: 'Aleo Network',
        id: 'ALEO',
        theme: 'purple',
        lastSequence: data?.aleo?.lastSequenceFromBsc || 'N/A',
        assets: [
          { symbol: 'ALEO LOCKED', amount: parseAmount(formattedData?.aleoVlink?.supply) }
        ]
      },
      destination: {
        name: 'BSC Network',
        id: 'BSC',
        theme: 'yellow',
        lastSequence: data?.bsc?.lastSequence || 'N/A',
        assets: [
          { symbol: 'MINTED BSC', amount: parseAmount(formattedData?.bsc?.data) }
        ]
      }
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title-group">
            <div className="header-icon-box">
              <Droplets size={24} className="header-icon" />
            </div>
            <div>
              <h1>Bridge Liquidity Monitor</h1>
              <p>Real-time solvency and network status check</p>
            </div>
          </div>
          
          <button 
            className={`refresh-btn ${isLoading ? 'spinning' : ''}`}
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw size={14} /> 
            <span>{isLoading ? 'Refreshing...' : 'Auto-refreshing'}</span>
          </button>
        </div>

        {/* Error Banner */}
        {displayError && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{displayError}</span>
          </div>
        )}

        {/* Content Loop */}
        <div className="cards-stack">
          {bridges.map((bridge) => (
            <BridgeCard key={bridge.id} data={bridge} />
          ))}
        </div>

      </div>
    </div>
  );
};

// --- Sub Component: Bridge Card ---
const BridgeCard = ({ data }) => {
  return (
    <div className="bridge-card">
      
      {/* Card Header */}
      <div className="card-top-bar">
        <div className="route-indicator">
          <span className="network-tag">{data.source.id}</span>
          <ArrowRight size={14} className="arrow-icon" />
          <span className="network-tag">{data.destination.id}</span>
        </div>
        <div className="timestamp">
          Updated: {data.updated}
        </div>
      </div>

      {/* Main Body (Grid) */}
      <div className="card-grid">
        
        {/* Left: Source */}
        <NetworkColumn network={data.source} align="left" />

        {/* Center: Connector */}
        <div className="connector-column">
          <div className="connection-line">
            <div className="connection-flow"></div>
          </div>
          <div className="synced-badge">
            {/* <CheckCircle2 size={10} /> SYNCED */}
          </div>
        </div>

        {/* Right: Destination */}
        <NetworkColumn network={data.destination} align="right" />

      </div>

      {/* Footer: Solvency Check */}
      <div className="card-footer">
        {data.source.assets.map((srcAsset, idx) => {
          const destAsset = data.destination.assets[idx];
          if (!destAsset) return null;

          // Calculate Delta (Destination - Source)
          const diff = srcAsset.amount - destAsset.amount;
          // Ideally diff should be 0. We allow small variance.
          const isHealthy = Math.abs(diff) < 1.0; 

          return (
            <div key={srcAsset.symbol} className="solvency-row">
              <span className="solvency-label">{srcAsset.symbol} Pair</span>
              
              {/* Progress Bar Visual */}
              <div className="solvency-track">
                <div className={`solvency-fill ${isHealthy ? 'fill-green' : 'fill-amber'}`}></div>
              </div>

              {/* Numeric Delta */}
              <div className={`solvency-value ${isHealthy ? 'text-green' : 'text-amber'}`}>
                {isHealthy ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>{diff > 0 ? '+' : ''}{diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Sub Component: Network Column ---
const NetworkColumn = ({ network, align }) => {
  return (
    <div className={`network-col col-${align}`}>
      
      {/* Network Badge */}
      <div className={`network-pill theme-${network.theme}`}>
        <img src={NETWORK_ICONS[network.id]} alt={network.id} className="network-logo" />
        <span>{network.name}</span>
      </div>

      {/* Sequence Number Display */}
      {network.lastSequence && network.lastSequence !== 'N/A' && (
        <div className="sequence-indicator">
          <span className="sequence-label">Last Packet #</span>
          <span className="sequence-value">{network.lastSequence}</span>
        </div>
      )}

      {/* Assets */}
      <div className="asset-group">
        {network.assets.map(asset => (
          <div key={asset.symbol} className="asset-row">
            <div className="asset-name">{asset.symbol}</div>
            <div className="asset-val" data-full={asset.amount}>
              {asset.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;