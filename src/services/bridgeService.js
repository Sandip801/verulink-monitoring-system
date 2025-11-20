import AleoService from './aleoService';
import BSCService from './bscService';
import { calculatePercentageChange } from '../utils/helpers';
import { formatTokenAmount } from '../utils/formatters';
import { NETWORK_STATUS, DATA_FORMATS } from '../utils/constants';

/**
 * Bridge service that combines data from multiple chains
 */
class BridgeService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
  }

  /**
   * Get cached data or fetch new data
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data
   * @returns {Promise<any>} Cached or fresh data
   */
  async getCachedData(key, fetchFn) {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(key, { data, timestamp: now });
      return data;
    } catch (error) {
      // Return cached data if fetch fails and we have cache
      if (cached) {
        console.warn(`Using cached data for ${key} due to fetch error:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get all bridge metrics
   * @returns {Promise<Object>} Combined bridge data
   */
  async getAllBridgeData() {
    try {
      const [aleoData, bscData] = await Promise.allSettled([
        this.getCachedData('aleo_metrics', () => AleoService.getAllMetrics()),
        this.getCachedData('bsc_metrics', () => BSCService.getAllMetrics()),
      ]);

      // Process Aleo data
      const aleoMetrics = aleoData.status === 'fulfilled' ? aleoData.value : {
        totalSupply: { value: '0', error: 'Failed to fetch' },
        creditsBalance: { value: '0', error: 'Failed to fetch' }
      };

      // Process BSC data
      const bscMetrics = bscData.status === 'fulfilled' ? bscData.value : {
        totalSupply: { value: '0', error: 'Failed to fetch' }
      };

      return {
        aleo: {
          totalSupply: aleoMetrics.totalSupply.value,
          totalSupplyFormatted: formatTokenAmount(aleoMetrics.totalSupply.value, 6), // Use 6 decimals for Aleo
          creditsBalance: aleoMetrics.creditsBalance.value,
          creditsBalanceFormatted: formatTokenAmount(aleoMetrics.creditsBalance.value, 6), // Use 6 decimals for credits
          error: aleoMetrics.totalSupply.error || aleoMetrics.creditsBalance.error
        },
        bsc: {
          totalSupply: bscMetrics.totalSupply.value,
          totalSupplyFormatted: formatTokenAmount(bscMetrics.totalSupply.value, bscMetrics.tokenInfo?.decimals || 6), // Use token decimals
          tokenInfo: bscMetrics.tokenInfo,
          error: bscMetrics.totalSupply.error
        },
        timestamp: new Date().toISOString(),
        loading: false
      };
    } catch (error) {
      console.error('Error fetching bridge data:', error);
      throw error;
    }
  }

  /**
   * Get network health status
   * @returns {Promise<Object>} Network health data
   */
  async getNetworkHealth() {
    try {
      const [aleoHealth, bscHealth] = await Promise.allSettled([
        this.getCachedData('aleo_health', () => AleoService.isNetworkHealthy()),
        this.getCachedData('bsc_health', () => BSCService.isNetworkHealthy()),
      ]);

      return {
        aleo: {
          status: aleoHealth.status === 'fulfilled' && aleoHealth.value ? NETWORK_STATUS.ONLINE : NETWORK_STATUS.OFFLINE,
          healthy: aleoHealth.status === 'fulfilled' ? aleoHealth.value : false,
          error: aleoHealth.status === 'rejected' ? aleoHealth.reason?.message : null
        },
        bsc: {
          status: bscHealth.status === 'fulfilled' && bscHealth.value ? NETWORK_STATUS.ONLINE : NETWORK_STATUS.OFFLINE,
          healthy: bscHealth.status === 'fulfilled' ? bscHealth.value : false,
          error: bscHealth.status === 'rejected' ? bscHealth.reason?.message : null
        },
        overall: {
          status: (aleoHealth.status === 'fulfilled' && aleoHealth.value && 
                  bscHealth.status === 'fulfilled' && bscHealth.value) ? 
                  NETWORK_STATUS.ONLINE : NETWORK_STATUS.WARNING,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error checking network health:', error);
      return {
        aleo: { status: NETWORK_STATUS.OFFLINE, healthy: false },
        bsc: { status: NETWORK_STATUS.OFFLINE, healthy: false },
        overall: { status: NETWORK_STATUS.OFFLINE, timestamp: new Date().toISOString() }
      };
    }
  }

  /**
   * Calculate bridge statistics
   * @param {Object} currentData - Current bridge data
   * @param {Object} previousData - Previous bridge data (optional)
   * @returns {Object} Bridge statistics
   */
  calculateBridgeStats(currentData, previousData = null) {
    const stats = {
      totalLiquidity: 0,
      liquidityChange: 0,
      utilizationRate: 0,
      dailyVolume: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Calculate total liquidity (sum of all supplies)
      const aleoSupply = parseFloat(currentData.aleo.totalSupplyFormatted) || 0;
      const bscSupply = parseFloat(currentData.bsc.totalSupplyFormatted) || 0;
      stats.totalLiquidity = aleoSupply + bscSupply;

      // Calculate liquidity change if previous data is available
      if (previousData) {
        const prevAleoSupply = parseFloat(previousData.aleo.totalSupplyFormatted) || 0;
        const prevBscSupply = parseFloat(previousData.bsc.totalSupplyFormatted) || 0;
        const prevTotalLiquidity = prevAleoSupply + prevBscSupply;
        
        stats.liquidityChange = calculatePercentageChange(prevTotalLiquidity, stats.totalLiquidity);
      }

      // Calculate utilization rate (example: credits balance vs total supply)
      const creditsBalance = parseFloat(currentData.aleo.creditsBalanceFormatted) || 0;
      if (stats.totalLiquidity > 0) {
        stats.utilizationRate = (creditsBalance / stats.totalLiquidity) * 100;
      }

      // Mock daily volume (in a real implementation, this would come from transaction data)
      stats.dailyVolume = stats.totalLiquidity * 0.05; // 5% of total liquidity as example

    } catch (error) {
      console.error('Error calculating bridge stats:', error);
    }

    return stats;
  }

  /**
   * Get bridge transaction history (mock implementation)
   * @param {number} limit - Number of transactions to return
   * @returns {Promise<Array>} Transaction history
   */
  async getTransactionHistory(limit = 50) {
    // This would fetch real transaction data in a production environment
    const mockTransactions = [];
    const now = Date.now();

    for (let i = 0; i < limit; i++) {
      mockTransactions.push({
        id: `tx_${Date.now()}_${i}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: Math.random() > 0.5 ? 'bridge_to_bsc' : 'bridge_to_aleo',
        amount: (Math.random() * 1000).toFixed(6),
        from: Math.random() > 0.5 ? 'aleo' : 'bsc',
        to: Math.random() > 0.5 ? 'bsc' : 'aleo',
        status: 'completed',
        timestamp: new Date(now - (i * 60000)).toISOString(), // Every minute
        fee: (Math.random() * 0.01).toFixed(6)
      });
    }

    return mockTransactions;
  }

  /**
   * Get bridge analytics data
   * @param {string} timeRange - Time range for analytics (24h, 7d, 30d)
   * @returns {Promise<Object>} Analytics data
   */
  async getBridgeAnalytics(timeRange = '24h') {
    // Mock analytics data - in production, this would query historical data
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const dataPoints = [];
    const now = Date.now();

    for (let i = 0; i < hours; i++) {
      dataPoints.push({
        timestamp: new Date(now - (i * 3600000)).toISOString(),
        volume: Math.random() * 10000,
        liquidity: 1000000 + (Math.random() * 100000),
        transactions: Math.floor(Math.random() * 50),
        fees: Math.random() * 100
      });
    }

    return {
      timeRange,
      dataPoints: dataPoints.reverse(),
      summary: {
        totalVolume: dataPoints.reduce((sum, point) => sum + point.volume, 0),
        avgLiquidity: dataPoints.reduce((sum, point) => sum + point.liquidity, 0) / dataPoints.length,
        totalTransactions: dataPoints.reduce((sum, point) => sum + point.transactions, 0),
        totalFees: dataPoints.reduce((sum, point) => sum + point.fees, 0)
      }
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Subscribe to bridge updates
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToUpdates(callback) {
    const interval = setInterval(async () => {
      try {
        const bridgeData = await this.getAllBridgeData();
        const healthData = await this.getNetworkHealth();
        
        callback({
          bridge: bridgeData,
          health: healthData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error in bridge update subscription:', error);
        callback({ error: error.message });
      }
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }
}

// Create singleton instance
const bridgeService = new BridgeService();

export default bridgeService;