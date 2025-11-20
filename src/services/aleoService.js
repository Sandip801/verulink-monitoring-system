import { fetchRequest, apiRequest } from './api';
import { CONTRACT_ADDRESSES } from '../utils/constants';
import { parseAleoValue } from '../utils/formatters';

/**
 * Aleo blockchain service for fetching data - NO MOCK VALUES
 */
class AleoService {
  static baseUrl = 'https://api.explorer.provable.com/v1/mainnet';

  /**
   * Get vToken supply from Aleo bridge contract
   * @param {string} fieldKey - Field key for the token (vUSDC, vETH, vUSDT)
   * @returns {Promise<Object>} Token supply data
   */
  static async getTokenSupply(fieldKey) {
    const endpoint = `${this.baseUrl}/program/vlink_token_service_v3.aleo/mapping/total_supply/%7Bchain_id:%20422842677816u128,%20token_id:%20${fieldKey}%7D`;
    
    console.log(`Fetching Aleo ${fieldKey} supply from:`, endpoint);
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      console.log(`Aleo ${fieldKey} supply raw response:`, response);
      
      let value = '0';
      
      if (typeof response === 'string') {
        value = parseAleoValue(response);
        console.log(`Parsed ${fieldKey} supply value:`, value);
      } else if (response && typeof response.value !== 'undefined') {
        value = parseAleoValue(response.value);
        console.log(`Parsed ${fieldKey} supply value from object:`, value);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error(`Invalid response format from Aleo ${fieldKey} supply API`);
      }
      
      if (!value || value === '0') {
        throw new Error(`No valid ${fieldKey} supply data received from Aleo API`);
      }
      
      return {
        value: value,
        timestamp: new Date().toISOString(),
        source: `aleo_${fieldKey.toLowerCase()}_supply`
      };
    });
  }

  /**
   * Get all vToken supplies
   * @returns {Promise<Object>} All token supplies
   */
  static async getAllTokenSupplies() {
    const tokens = {
      vUSDC: '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
      vETH: '1381601714105276218895759962490543360839827276760458984912661726715051428034field',
      vUSDT: '7311977476241952331367670434347097026669181172395481678807963832961201831695field'
    };

    const results = await Promise.allSettled(
      Object.entries(tokens).map(([tokenName, fieldKey]) =>
        this.getTokenSupply(fieldKey).then(result => ({
          name: tokenName,
          ...result
        }))
      )
    );

    const supplies = {};
    results.forEach((result, index) => {
      const tokenName = Object.keys(tokens)[index];
      if (result.status === 'fulfilled') {
        supplies[tokenName] = result.value;
      } else {
        supplies[tokenName] = {
          value: '0',
          error: result.reason?.message || 'Failed to fetch supply',
          timestamp: new Date().toISOString()
        };
      }
    });

    return supplies;
  }

  /**
   * Get credits balance for bridge address
   * @returns {Promise<Object>} Credits balance data
   */
  static async getCreditsBalance() {
    const endpoint = `${this.baseUrl}/program/credits.aleo/mapping/account/${CONTRACT_ADDRESSES.ALEO_BRIDGE_ADDRESS}`;
    
    console.log('Fetching Aleo credits balance from:', endpoint);
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      console.log('Aleo credits balance raw response:', response);
      
      let value = '0';
      
      if (typeof response === 'string') {
        value = parseAleoValue(response);
        console.log('Parsed credits balance value:', value);
      } else if (response && typeof response.value !== 'undefined') {
        value = parseAleoValue(response.value);
        console.log('Parsed credits balance value from object:', value);
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from Aleo credits balance API');
      }
      
      return {
        value: value || '0',
        timestamp: new Date().toISOString(),
        source: 'aleo_credits_balance'
      };
    });
  }

  /**
   * Get contract balance for a specific program
   * @param {string} programId - Program ID to query
   * @param {string} mappingName - Mapping name to query
   * @returns {Promise<Object>} Contract balance data
   */
  static async getContractBalance(programId, mappingName = 'balance') {
    const endpoint = `${this.baseUrl}/program/${programId}/mapping/${mappingName}`;
    
    console.log('Fetching contract balance from:', endpoint);
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      console.log('Contract balance raw response:', response);
      
      let value = '0';
      
      if (typeof response === 'string') {
        value = parseAleoValue(response);
      } else if (response && typeof response.value !== 'undefined') {
        value = parseAleoValue(response.value);
      } else {
        throw new Error(`Invalid response format from ${programId} balance API`);
      }
      
      return {
        value: value || '0',
        timestamp: new Date().toISOString(),
        source: `aleo_contract_balance_${programId}`
      };
    });
  }

  /**
   * Get program information
   * @param {string} programId - Program ID to query
   * @returns {Promise<Object>} Program data
   */
  static async getProgramInfo(programId) {
    const endpoint = `${this.baseUrl}/program/${programId}`;
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      if (!response) {
        throw new Error(`No program information found for ${programId}`);
      }
      return response;
    });
  }

  /**
   * Get transaction history for an address
   * @param {string} address - Aleo address
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Array>} Transaction history
   */
  static async getTransactionHistory(address, limit = 10) {
    const endpoint = `${this.baseUrl}/address/${address}/transactions?limit=${limit}`;
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      if (!response || !Array.isArray(response.transactions)) {
        throw new Error(`No transaction history found for address ${address}`);
      }
      return response.transactions;
    });
  }

  /**
   * Get block information
   * @param {number|string} blockHeight - Block height or hash
   * @returns {Promise<Object>} Block data
   */
  static async getBlock(blockHeight) {
    const endpoint = `${this.baseUrl}/block/${blockHeight}`;
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      if (!response) {
        throw new Error(`No block data found for ${blockHeight}`);
      }
      return response;
    });
  }

  /**
   * Get latest block information
   * @returns {Promise<Object>} Latest block data
   */
  static async getLatestBlock() {
    const endpoint = `${this.baseUrl}/latest/block`;
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      if (!response) {
        throw new Error('No latest block data available');
      }
      return response;
    });
  }

  /**
   * Get network statistics
   * @returns {Promise<Object>} Network stats
   */
  static async getNetworkStats() {
    const endpoint = `${this.baseUrl}/network/stats`;
    
    return await apiRequest(async () => {
      const response = await fetchRequest(endpoint);
      if (!response) {
        throw new Error('No network statistics available');
      }
      return response;
    });
  }

  /**
   * Check if Aleo network is healthy
   * @returns {Promise<boolean>} Network health status
   */
  static async isNetworkHealthy() {
    try {
      const latestBlock = await this.getLatestBlock();
      
      if (!latestBlock || !latestBlock.timestamp) {
        return false;
      }
      
      const blockTime = new Date(latestBlock.timestamp);
      const now = new Date();
      const timeDiff = now - blockTime;
      
      // Consider healthy if latest block is within 5 minutes
      return timeDiff < 5 * 60 * 1000;
    } catch (error) {
      console.error('Aleo network health check failed:', error);
      return false;
    }
  }

  /**
   * Get multiple metrics in parallel
   * @returns {Promise<Object>} Combined metrics data
   */
  static async getAllMetrics() {
    const [supplies, creditsBalance, latestBlock] = await Promise.allSettled([
      this.getAllTokenSupplies(),
      this.getCreditsBalance(),
      this.getLatestBlock(),
    ]);

    const result = {
      timestamp: new Date().toISOString(),
    };

    // Only include successful results
    if (supplies.status === 'fulfilled') {
      result.supplies = supplies.value;
    } else {
      result.suppliesError = supplies.reason?.message || 'Failed to fetch token supplies';
    }

    if (creditsBalance.status === 'fulfilled') {
      result.creditsBalance = creditsBalance.value;
    } else {
      result.creditsBalanceError = creditsBalance.reason?.message || 'Failed to fetch credits balance';
    }

    if (latestBlock.status === 'fulfilled') {
      result.latestBlock = latestBlock.value;
    } else {
      result.latestBlockError = latestBlock.reason?.message || 'Failed to fetch latest block';
    }

    return result;
  }

  /**
   * Subscribe to real-time updates (WebSocket placeholder)
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  static subscribeToUpdates(callback) {
    // This would implement WebSocket connection in a real scenario
    console.log('WebSocket subscription not implemented yet');
    
    // Return a dummy unsubscribe function
    return () => {
      console.log('Unsubscribed from Aleo updates');
    };
  }
}

export default AleoService;