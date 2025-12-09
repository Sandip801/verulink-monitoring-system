import { fetchRequest, apiRequest } from './api';

// Function signatures
const GET_LAST_SEQUENCE_SIGNATURE = '0x529d15cc'; // getLastReceivedSequence()

/**
 * BSC Service - Real totalSupply() call for your contract
 */
class BSCService {
  // BSCScan API configuration
  static BSCSCAN_API_URL = 'https://api.bscscan.com/api';
  static BSCSCAN_API_KEY = import.meta.env.VITE_BSCSCAN_API_KEY || '3BFB8Q5KV7ZAS23YQYDUZDGYCZZ8J4DVB8';
  
  // Your actual BSC token contract address
  static TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_BSC_TOKEN_CONTRACT || '0x6cfffa5bfd4277a04d83307feedfe2d18d944dd2';
  
  // BSC Bridge contract address
  static BRIDGE_CONTRACT_ADDRESS = import.meta.env.VITE_BSC_BRIDGE_CONTRACT || '0x397e47F5072B48681b170199551bdB7fBDa136b7';

  /**
   * Get minted tokens by calling totalSupply() on your BSC contract
   * Uses direct RPC call to avoid BSCScan API issues
   */
  static async getMintedTokens() {
    console.log('📡 Fetching BSC minted tokens from contract:', this.TOKEN_CONTRACT_ADDRESS);
    
    return await apiRequest(async () => {
      // Method 1: Direct BSC RPC call (most reliable)
      try {
        console.log('🔗 Using direct BSC RPC call...');
        
        const rpcUrl = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/';
        const rpcPayload = {
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: this.TOKEN_CONTRACT_ADDRESS,
              data: '0x18160ddd' // totalSupply() function selector
            },
            'latest'
          ],
          id: 1
        };
        
        console.log('📤 RPC request:', rpcPayload);
        
        const rpcResponse = await fetch(rpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rpcPayload)
        });
        
        if (!rpcResponse.ok) {
          throw new Error(`RPC request failed: ${rpcResponse.status} ${rpcResponse.statusText}`);
        }
        
        const rpcData = await rpcResponse.json();
        console.log('📥 RPC response:', rpcData);
        
        if (rpcData.error) {
          throw new Error(`RPC error: ${rpcData.error.message}`);
        }
        
        if (!rpcData.result) {
          throw new Error('No result in RPC response');
        }
        
        if (rpcData.result === '0x' || rpcData.result === '0x0') {
          throw new Error('Contract returned empty result - contract may not exist or not have totalSupply()');
        }
        
        // Convert hex result to decimal string
        const totalSupply = BigInt(rpcData.result).toString();
        console.log('✅ BSC totalSupply via RPC:', totalSupply);
        console.log('🔢 Hex value:', rpcData.result);
        console.log('🔢 Decimal value (raw):', totalSupply);
        console.log('🔢 Decimal value (6 decimals):', (Number(totalSupply) / 1000000).toFixed(6));
        
        return totalSupply;
        
      } catch (error) {
        console.error('❌ Direct RPC call failed:', error.message);
      }
      
      // Method 2: Try alternative BSC RPC endpoints
      const defaultRpc = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/';
      const alternativeRPCs = [
        defaultRpc,
        'https://bsc-dataseed2.binance.org/',
        'https://bsc-dataseed3.binance.org/',
        'https://bsc-dataseed4.binance.org/'
      ];
      
      for (const rpcUrl of alternativeRPCs) {
        try {
          console.log('🔗 Trying alternative RPC:', rpcUrl);
          
          const rpcPayload = {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              {
                to: this.TOKEN_CONTRACT_ADDRESS,
                data: '0x18160ddd'
              },
              'latest'
            ],
            id: 1
          };
          
          const rpcResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(rpcPayload)
          });
          
          if (!rpcResponse.ok) {
            throw new Error(`RPC ${rpcUrl} failed: ${rpcResponse.status}`);
          }
          
          const rpcData = await rpcResponse.json();
          
          if (rpcData.error) {
            throw new Error(`RPC error: ${rpcData.error.message}`);
          }
          
          if (rpcData.result && rpcData.result !== '0x' && rpcData.result !== '0x0') {
            const totalSupply = BigInt(rpcData.result).toString();
            console.log('✅ BSC totalSupply via alternative RPC:', totalSupply);
            return totalSupply;
          }
          
        } catch (error) {
          console.warn('⚠️ Alternative RPC failed:', rpcUrl, error.message);
          continue;
        }
      }
      
      // Method 3: Try BSCScan token stats (handle API v2 properly)
      try {
        console.log('🔗 Trying BSCScan token stats as fallback...');
        
        const statsUrl = `${this.BSCSCAN_API_URL}?module=stats&action=tokensupply&contractaddress=${this.TOKEN_CONTRACT_ADDRESS}&apikey=${this.BSCSCAN_API_KEY}`;
        
        const statsResponse = await fetchRequest(statsUrl);
        console.log('📥 BSCScan stats response:', statsResponse);
        
        // Handle both old and new API response formats
        if (statsResponse.status === '1' && statsResponse.result && 
            !statsResponse.result.includes('deprecated') && 
            !statsResponse.result.includes('V1 endpoint')) {
          console.log('✅ Got totalSupply from BSCScan stats:', statsResponse.result);
          return statsResponse.result;
        } else if (statsResponse.message && statsResponse.message.includes('deprecated')) {
          console.warn('⚠️ BSCScan API deprecated, using RPC results only');
        }
        
      } catch (error) {
        console.warn('⚠️ BSCScan stats API failed:', error.message);
      }
      
      // If all methods fail
      throw new Error('Unable to get BSC total supply - all methods failed. Contract may not exist or not implement totalSupply()');
    });
  }

  // /**
  //  * Test the contract to see if it exists and has totalSupply()
  //  */
  // static async testContract() {
  //   console.log('🧪 Testing BSC contract...');
    
  //   try {
  //     // First, check if the contract exists by getting its code
  //     const codeUrl = `${this.BSCSCAN_API_URL}?module=proxy&action=eth_getCode&address=${this.TOKEN_CONTRACT_ADDRESS}&tag=latest&apikey=${this.BSCSCAN_API_KEY}`;
      
  //     const codeResponse = await fetchRequest(codeUrl);
  //     console.log('📋 Contract code check:', codeResponse);
      
  //     if (!codeResponse.result || codeResponse.result === '0x') {
  //       console.warn('⚠️ No contract code found - contract may not exist at this address');
  //       return false;
  //     }
      
  //     // Now try the totalSupply call
  //     const totalSupply = await this.getMintedTokens();
  //     console.log('✅ Contract test successful, totalSupply:', totalSupply);
  //     return true;
      
  //   } catch (error) {
  //     console.error('❌ Contract test failed:', error.message);
  //     return false;
  //   }
  // }

  /**
   * Get contract information for debugging
   */
  static async getContractInfo() {
    console.log('ℹ️ Getting contract information...');
    
    try {
      // Get contract source code and ABI if verified
      const sourceUrl = `${this.BSCSCAN_API_URL}?module=contract&action=getsourcecode&address=${this.TOKEN_CONTRACT_ADDRESS}&apikey=${this.BSCSCAN_API_KEY}`;
      
      const sourceResponse = await fetchRequest(sourceUrl);
      console.log('📜 Contract source info:', sourceResponse);
      
      if (sourceResponse.status === '1' && sourceResponse.result[0].SourceCode) {
        console.log('✅ Contract is verified on BSCScan');
        console.log('📝 Contract name:', sourceResponse.result[0].ContractName);
        return {
          verified: true,
          name: sourceResponse.result[0].ContractName,
          compiler: sourceResponse.result[0].CompilerVersion
        };
      } else {
        console.log('⚠️ Contract is not verified on BSCScan');
        return {
          verified: false,
          name: 'Unknown',
          compiler: 'Unknown'
        };
      }
    } catch (error) {
      console.error('❌ Failed to get contract info:', error);
      return null;
    }
  }

  /**
   * Placeholder methods (return null since you only need minted tokens)
   */
  static async getBridgeContractBalance() {
    console.log('ℹ️ getBridgeContractBalance() - returning null (not implemented)');
    return null;
  }

  static async getDailyBridgeVolume() {
    console.log('ℹ️ getDailyBridgeVolume() - returning null (not implemented)');
    return null;
  }

  static async getPendingTransactions() {
    console.log('ℹ️ getPendingTransactions() - returning null (not implemented)');
    return null;
  }

  /**
   * Check if BSC service is configured
   */
  static isConfigured() {
    const configured = !!(this.TOKEN_CONTRACT_ADDRESS && this.BSCSCAN_API_KEY);
    console.log('🔧 BSC Service configured:', configured);
    return configured;
  }
}

export default BSCService;

export const fetchBSCData = async () => {
  try {
    console.log('🟡 Fetching BSC data...');
    
    // Fetch total supply and last sequence in parallel
    const [totalSupply, lastSequence] = await Promise.all([
      BSCService.getMintedTokens(),
      fetchBscLastReceivedSequence(),
    ]);
    
    const bscData = {
      totalSupply: formatTokenValue(totalSupply, 6),
      lastSequence: lastSequence,
      status: 'online',
    };

    console.log('✅ BSC data fetched:', bscData);
    return bscData;
  } catch (error) {
    console.error('❌ Error fetching BSC data:', error);
    return {
      totalSupply: 'N/A',
      lastSequence: 'N/A',
      status: 'error',
    };
  }
};

const formatTokenValue = (value, decimals) => {
  if (!value || typeof value !== 'string') return 'N/A';

  let cleanValue = value.replace(/u128$/, '').trim();

  if (cleanValue === '' || isNaN(cleanValue)) return 'N/A';

  try {
    const numValue = BigInt(cleanValue);
    const divisor = BigInt(10 ** decimals);
    
    const wholeValue = numValue / divisor;
    const remainderValue = numValue % divisor;
    
    const remainder = remainderValue.toString().padStart(decimals, '0');
    const formattedRemainder = remainder.substring(0, decimals).replace(/0+$/, '');
    
    if (formattedRemainder === '') {
      return wholeValue.toString();
    }
    
    return `${wholeValue}.${formattedRemainder}`;
  } catch (error) {
    console.error('Error formatting token value:', error);
    return value;
  }
};

const fetchBscLastReceivedSequence = async () => {
  try {
    console.log('🟡 Fetching BSC last received sequence...');
    
    const rpcUrl = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/';
    const bridgeContract = BSCService.BRIDGE_CONTRACT_ADDRESS;

    const payload = {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: bridgeContract,
          data: GET_LAST_SEQUENCE_SIGNATURE
        },
        'latest'
      ],
      id: 1
    };

    console.log('🟡 BSC sequence RPC request:', payload);

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn('⚠️ BSC sequence RPC request failed:', response.status, response.statusText);
      return 'N/A';
    }

    const data = await response.json();
    console.log('🟡 BSC sequence RPC response:', data);

    if (data.error) {
      console.error('❌ RPC error:', data.error);
      return 'N/A';
    }

    if (!data.result || data.result === '0x' || data.result === '0x0') {
      console.log('⚠️ No sequence data, returning 0');
      return '0';
    }

    const sequence = BigInt(data.result).toString();
    console.log('✅ BSC last received sequence:', sequence);
    return sequence;
  } catch (error) {
    console.error('❌ Error fetching BSC last received sequence:', error);
    return 'N/A';
  }
};