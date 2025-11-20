/**
 * Aleo Chain Service - Fetches real data from Aleo blockchain
 */

class AleoChainService {
  static baseUrl = 'https://api.explorer.provable.com/v1/mainnet';

  /**
   * Fetch single token supply
   */
  static async fetchTokenSupply(tokenKey, tokenName) {
    const endpoint = `${this.baseUrl}/program/vlink_token_service_v3.aleo/mapping/total_supply/${tokenKey}`;
    
    console.log(`🔗 Fetching Aleo ${tokenName}:`, endpoint);

    try {
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      console.log(`✅ Aleo ${tokenName} response:`, data);

      return {
        name: tokenName,
        value: data,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
    } catch (error) {
      console.error(`❌ Aleo ${tokenName} error:`, error);
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
   * Fetch all token supplies from Aleo
   */
  static async fetchAllTokenSupplies() {
    const tokens = {
      vUSDC: '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
      vETH: '1381601714105276218895759962490543360839827276760458984912661726715051428034field',
      vUSDT: '7311977476241952331367670434347097026669181172395481678807963832961201831695field'
    };

    console.log('🔄 Starting Aleo token supplies fetch...');

    const results = await Promise.allSettled(
      Object.entries(tokens).map(([name, key]) =>
        this.fetchTokenSupply(key, name)
      )
    );

    const suppliesData = {
      timestamp: new Date().toISOString(),
      chain: 'Aleo',
      tokens: {}
    };

    results.forEach((result, index) => {
      const tokenName = Object.keys(tokens)[index];
      
      if (result.status === 'fulfilled') {
        suppliesData.tokens[tokenName] = result.value;
      } else {
        suppliesData.tokens[tokenName] = {
          name: tokenName,
          value: null,
          error: result.reason?.message || 'Unknown error',
          status: 'error'
        };
      }
    });

    console.log('📊 Aleo supplies data:', suppliesData);
    return suppliesData;
  }

  /**
   * Check if Aleo network is responsive
   */
  static async checkHealth() {
    try {
      // Try to fetch a simple endpoint to check connectivity
      const endpoint = `${this.baseUrl}/program/credits.aleo`;
      const response = await fetch(endpoint, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      // 404 is fine - it means the API is responding
      return { 
        healthy: response.status < 500, 
        status: response.status < 500 ? 'online' : 'offline' 
      };
    } catch (error) {
      console.error('Aleo health check failed:', error);
      return { healthy: false, status: 'offline', error: error.message };
    }
  }
}

export default AleoChainService;