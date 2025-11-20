import { apiRequest } from './api';

/**
 * Ethereum blockchain service for fetching contract data
 */
class EthService {
  static contractAddress = '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170';
  static rpcUrl = process.env.REACT_APP_ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo';

  /**
   * Get ERC20 token balance
   * @param {string} tokenAddress - Token contract address
   * @param {string} walletAddress - Wallet address to check balance for
   * @returns {Promise<Object>} Token balance data
   */
  static async getTokenBalance(tokenAddress, walletAddress) {
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: `0x70a08231000000000000000000000000${walletAddress.slice(2).padStart(40, '0')}`
        },
        'latest'
      ],
      id: 1
    };

    console.log(`Fetching ETH token balance for ${tokenAddress}`);

    return await apiRequest(async () => {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ETH token balance raw response:', data);

      if (data.error) {
        throw new Error(data.error.message);
      }

      const hexValue = data.result;
      const value = BigInt(hexValue).toString();

      return {
        value: value,
        timestamp: new Date().toISOString(),
        source: `eth_token_balance_${tokenAddress}`
      };
    });
  }

  /**
   * Get ETH balance
   * @param {string} address - Address to check balance for
   * @returns {Promise<Object>} ETH balance data
   */
  static async getEthBalance(address) {
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1
    };

    console.log(`Fetching ETH balance for ${address}`);

    return await apiRequest(async () => {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ETH balance raw response:', data);

      if (data.error) {
        throw new Error(data.error.message);
      }

      const hexValue = data.result;
      const value = BigInt(hexValue).toString();

      return {
        value: value,
        timestamp: new Date().toISOString(),
        source: 'eth_balance'
      };
    });
  }

  /**
   * Get all contract balances (USDC, USDT, ETH)
   * @returns {Promise<Object>} All balances
   */
  static async getAllContractBalances() {
    const balances = {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC on Ethereum
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
      ETH: null // ETH is native
    };

    const results = await Promise.allSettled([
      this.getTokenBalance(balances.USDC, this.contractAddress),
      this.getTokenBalance(balances.USDT, this.contractAddress),
      this.getEthBalance(this.contractAddress)
    ]);

    return {
      USDC: results[0].status === 'fulfilled' ? results[0].value : {
        value: '0',
        error: results[0].reason?.message || 'Failed to fetch USDC balance'
      },
      USDT: results[1].status === 'fulfilled' ? results[1].value : {
        value: '0',
        error: results[1].reason?.message || 'Failed to fetch USDT balance'
      },
      ETH: results[2].status === 'fulfilled' ? results[2].value : {
        value: '0',
        error: results[2].reason?.message || 'Failed to fetch ETH balance'
      },
      timestamp: new Date().toISOString()
    };
  }
}

export default EthService;