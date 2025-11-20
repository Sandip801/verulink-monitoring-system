import { DATA_FORMATS } from './constants';

/**
 * Parse Aleo response format (removes u64, u128, field suffixes)
 * @param {string|number} value - Aleo response value
 * @returns {string} Cleaned numeric string
 */
export const parseAleoValue = (value) => {
  if (typeof value === 'number') return value.toString();
  if (typeof value !== 'string') return '0';
  
  // Remove Aleo type suffixes: u8, u16, u32, u64, u128, field
  return value.replace(/(u8|u16|u32|u64|u128|field)$/i, '');
};

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 * @param {number|string} num - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number with suffix
 */
export const formatNumber = (num, decimals = DATA_FORMATS.DISPLAY_DECIMALS) => {
  if (num === 0 || num === '0') return '0';
  
  const value = typeof num === 'string' ? parseFloat(parseAleoValue(num)) : num;
  
  if (isNaN(value)) return '0';
  
  if (value >= 1e18) return (value / 1e18).toFixed(decimals) + 'E';
  if (value >= 1e15) return (value / 1e15).toFixed(decimals) + 'P';
  if (value >= 1e12) return (value / 1e12).toFixed(decimals) + 'T';
  if (value >= 1e9) return (value / 1e9).toFixed(decimals) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(decimals) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(decimals) + 'K';
  
  return value.toFixed(decimals);
};

/**
 * Format token amounts by dividing by decimals
 * @param {string|number} amount - Raw token amount
 * @param {number} decimals - Token decimals (default 18)
 * @returns {number} Formatted token amount
 */
export const formatTokenAmount = (amount, decimals = DATA_FORMATS.ALEO_DECIMALS) => {
  if (!amount || amount === '0') return 0;
  
  const cleanValue = parseAleoValue(amount);
  const value = typeof cleanValue === 'string' ? parseFloat(cleanValue) : cleanValue;
  return value / Math.pow(10, decimals);
};

/**
 * Format Aleo token amounts (using 6 decimals based on the API response)
 * @param {string|number} amount - Raw Aleo amount
 * @returns {string} Formatted Aleo amount
 */
export const formatAleoAmount = (amount) => {
  // Aleo seems to use 6 decimals based on the API responses
  const formatted = formatTokenAmount(amount, 6);
  return formatNumber(formatted);
};

/**
 * Format Credits amounts
 * @param {string|number} amount - Raw credits amount
 * @returns {string} Formatted credits amount
 */
export const formatCreditsAmount = (amount) => {
  const formatted = formatTokenAmount(amount, DATA_FORMATS.CREDITS_DECIMALS);
  return formatNumber(formatted);
};

/**
 * Format BSC token amounts
 * @param {string|number} amount - Raw BSC amount
 * @returns {string} Formatted BSC amount
 */
export const formatBscAmount = (amount) => {
  const formatted = formatTokenAmount(amount, DATA_FORMATS.BSC_DECIMALS);
  return formatNumber(formatted);
};

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format percentage values
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format time ago string
 * @param {Date|string} date - Date to format
 * @returns {string} Time ago string
 */
export const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

/**
 * Format address for display (truncate middle)
 * @param {string} address - Blockchain address
 * @param {number} startChars - Characters to show at start
 * @param {number} endChars - Characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format hash for display
 * @param {string} hash - Transaction or block hash
 * @returns {string} Formatted hash
 */
export const formatHash = (hash) => {
  return formatAddress(hash, 8, 6);
};

/**
 * Format timestamp to readable date
 * @param {number|string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};