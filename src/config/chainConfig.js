import { API_CONFIG } from './apiConfig';

/**
 * Chain Configuration - Centralized settings for all blockchain networks
 */

export const CHAIN_CONFIG = {
  ALEO: {
    name: 'Aleo',
    id: 'aleo',
    icon: '🟣',
    color: '#667eea',
    rpcUrl: API_CONFIG.ALEO_API_URL,
    contract: import.meta.env.VITE_ALEO_TOKEN_SERVICE_PROGRAM || 'vlink_token_service_v3.aleo',
    mapping: 'total_supply',
    tokens: {
      vUSDC: {
        name: 'vUSDC',
        symbol: 'vUSDC',
        decimals: 6,
        fieldKey: import.meta.env.VITE_ALEO_VUSDC_FIELD_KEY || '6088188135219746443092391282916151282477828391085949070550825603498725268775field'
      },
      vETH: {
        name: 'vETH',
        symbol: 'vETH',
        decimals: 18,
        fieldKey: import.meta.env.VITE_ALEO_VETH_FIELD_KEY || '1381601714105276218895759962490543360839827276760458984912661726715051428034field'
      },
      vUSDT: {
        name: 'vUSDT',
        symbol: 'vUSDT',
        decimals: 6,
        fieldKey: import.meta.env.VITE_ALEO_VUSDT_FIELD_KEY || '7311977476241952331367670434347097026669181172395481678807963832961201831695field'
      }
    }
  },

  ETHEREUM: {
    name: 'Ethereum',
    id: 'ethereum',
    icon: '🔴',
    color: '#627eea',
    rpcUrl: API_CONFIG.ETHEREUM_RPC_URL,
    bridgeContract: API_CONFIG.BRIDGE_CONTRACTS.ETHEREUM,
    tokens: {
      USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        address: import.meta.env.VITE_ETH_USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      },
      USDT: {
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        address: import.meta.env.VITE_ETH_USDT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7'
      },
      ETH: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        address: null // Native token
      }
    }
  },

  BSC: {
    name: 'Binance Smart Chain',
    id: 'bsc',
    icon: '🟡',
    color: '#f3ba2f',
    rpcUrl: import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    bridgeContract: import.meta.env.VITE_BSC_BRIDGE_CONTRACT || '0x...',
    tokens: {
      USDC: {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        address: import.meta.env.VITE_BSC_USDC_ADDRESS || '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
      },
      USDT: {
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6,
        address: import.meta.env.VITE_BSC_USDT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955'
      }
    }
  }
};

export const REFRESH_CONFIG = {
  ALEO: parseInt(import.meta.env.VITE_ALEO_POLLING_INTERVAL) || 30000,
  ETHEREUM: parseInt(import.meta.env.VITE_ETHEREUM_POLLING_INTERVAL) || 45000,
  BSC: parseInt(import.meta.env.VITE_BSC_POLLING_INTERVAL) || 45000,
  DASHBOARD: parseInt(import.meta.env.VITE_DASHBOARD_REFRESH_INTERVAL) || 60000
};

export default CHAIN_CONFIG;