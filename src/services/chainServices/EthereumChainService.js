import { API_CONFIG } from '../../config/apiConfig';

/**
 * Ethereum Chain Service - Fetches real data from Ethereum blockchain
 */

class EthereumChainService {
  static rpcUrl = API_CONFIG.ETHEREUM_RPC_URL;
  static bridgeContract = API_CONFIG.BRIDGE_CONTRACTS.ETHEREUM;

  /**
   * Make JSON-RPC call
   */
  static async rpcCall(method, params) {
    const payload = {
      jsonrpc: '2.0',
      method,
      params,
      id: Math.floor(Math.random() * 1000000)
    };

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`);
      }

      return data.result;
    } catch (error) {
      console.error('RPC call error:', error);
      throw error;
    }
  }

  /**
   * Fetch ERC20 token balance
   */
  static async fetchTokenBalance(tokenAddress, walletAddress) {
    const tokenName = this.getTokenName(tokenAddress);
    
    console.log(`🔗 Fetching Ethereum ${tokenName} balance...`);

    try {
      // ERC20 balanceOf(address) call
      const data = `0x70a08231000000000000000000000000${walletAddress.slice(2).padStart(40, '0')}`;
      
      const balance = await this.rpcCall('eth_call', [
        {
          to: tokenAddress,
          data: data
        },
        'latest'
      ]);

      const value = BigInt(balance).toString();

      console.log(`✅ Ethereum ${tokenName} balance:`, value);

      return {
        name: tokenName,
        value: value,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      console.error(`❌ Ethereum ${tokenName} error:`, error);
      return {
        name: tokenName,
        value: null,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
    }
  }

  /**
   * Fetch ETH native balance
   */
  static async fetchEthBalance(address) {
    console.log('🔗 Fetching Ethereum ETH balance...');

    try {
      const balance = await this.rpcCall('eth_getBalance', [address, 'latest']);
      const value = BigInt(balance).toString();

      console.log('✅ Ethereum ETH balance:', value);

      return {
        name: 'ETH',
        value: value,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      console.error('❌ Ethereum ETH error:', error);
      return {
        name: 'ETH',
        value: null,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
    }
  }

  /**
   * Fetch all bridge contract balances
   */
  static async fetchAllBalances() {
    console.log('🔄 Starting Ethereum balances fetch...');

    const results = await Promise.allSettled([
      this.fetchTokenBalance('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', this.bridgeContract), // USDC
      this.fetchTokenBalance('0xdAC17F958D2ee523a2206206994597C13D831ec7', this.bridgeContract), // USDT
      this.fetchEthBalance(this.bridgeContract) // ETH
    ]);

    const balancesData = {
      timestamp: new Date().toISOString(),
      chain: 'Ethereum',
      tokens: {}
    };

    const tokenNames = ['USDC', 'USDT', 'ETH'];

    results.forEach((result, index) => {
      const tokenName = tokenNames[index];
      
      if (result.status === 'fulfilled') {
        balancesData.tokens[tokenName] = result.value;
      } else {
        balancesData.tokens[tokenName] = {
          name: tokenName,
          value: null,
          error: result.reason?.message || 'Unknown error',
          status: 'error'
        };
      }
    });

    console.log('📊 Ethereum balances data:', balancesData);
    return balancesData;
  }

  /**
   * Check if Ethereum network is responsive
   */
  static async checkHealth() {
    try {
      await this.rpcCall('eth_blockNumber', []);
      return { healthy: true, status: 'online' };
    } catch (error) {
      console.error('Ethereum health check failed:', error);
      return { healthy: false, status: 'offline', error: error.message };
    }
  }

  /**
   * Get token name from address
   */
  static getTokenName(address) {
    const tokens = {
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT'
    };
    return tokens[address] || 'Unknown';
  }
}

export default EthereumChainService;