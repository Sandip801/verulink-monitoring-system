/**
 * API Configuration
 */

export const API_CONFIG = {
  ETHEREUM_RPC_URL: import.meta.env.VITE_ETH_RPC_URL || 
    (typeof window !== 'undefined' && window.REACT_APP_ETH_RPC_URL) ||
    'https://eth-mainnet.g.alchemy.com/v2/demo',
  
  ALEO_API_URL: 'https://api.explorer.provable.com/v1/mainnet',
  
  BRIDGE_CONTRACTS: {
    ETHEREUM: '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170'
  }
};

export default API_CONFIG;