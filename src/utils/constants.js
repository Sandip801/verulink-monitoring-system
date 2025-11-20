// API Endpoints
export const API_ENDPOINTS = {
  ALEO_BASE_URL: 'https://api.explorer.provable.com/v1/mainnet',
  BSC_RPC_URL: 'https://bsc-dataseed.binance.org/',
};

// Contract Addresses
export const CONTRACT_ADDRESSES = {
  BSC_BRIDGE_CONTRACT: '0x6cfffa5bfd4277a04d83307feedfe2d18d944dd2',
  ALEO_BRIDGE_ADDRESS: 'aleo1er7zejft45vajxr7q0v44n4mw0v32ac6jww7xulnyzpur0wuygzq2atznq'
};

// Refresh Intervals
export const REFRESH_INTERVALS = {
  DASHBOARD: 30000, // 30 seconds
  CHARTS: 60000, // 1 minute
  STATUS: 10000, // 10 seconds
};

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#06b6d4',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  GRADIENT_START: '#06b6d4',
  GRADIENT_END: '#3b82f6',
};

// Network Status
export const NETWORK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  WARNING: 'warning',
  MAINTENANCE: 'maintenance',
};

// Data Format Constants
export const DATA_FORMATS = {
  ALEO_DECIMALS: 6, // Changed from 18 to 6 based on API response format
  BSC_DECIMALS: 18,
  CREDITS_DECIMALS: 6,
  DISPLAY_DECIMALS: 2,
};

// Menu Items
export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Activity' },
  { id: 'bridge', label: 'Bridge Status', icon: 'Database' },
  { id: 'analytics', label: 'Analytics', icon: 'TrendingUp' },
  { id: 'alerts', label: 'Alerts', icon: 'AlertTriangle' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_ERROR: 'API request failed. Please try again later.',
  INVALID_DATA: 'Invalid data received from the server.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
};