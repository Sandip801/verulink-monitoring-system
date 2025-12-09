const ETHEREUM_CONFIG = {
  rpcUrl: import.meta.env.VITE_ETH_RPC_URL || 'https://eth.llamarpc.com',
  bridgeContract: import.meta.env.VITE_ETH_TOKEN_MANAGER_CONTRACT || '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170',
  bridgeManagerContract: import.meta.env.VITE_ETH_BRIDGE_MANAGER_CONTRACT || '0x7440176A6F367D3Fad1754519bD8033EAF173133',
  tokens: {
    USDC: {
      address: import.meta.env.VITE_ETH_USDC_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      name: 'USDC'
    },
    USDT: {
      address: import.meta.env.VITE_ETH_USDT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'USDT'
    },
    ETH: {
      address: null,
      decimals: 18,
      name: 'ETH'
    }
  }
};

// Function signature for getLastReceivedSequence()
const GET_LAST_SEQUENCE_SIGNATURE = '0x529d15cc';

export const fetchEthereumData = async () => {
  try {
    console.log('\n🔴 ========== ETHEREUM DATA FETCH ==========');
    console.log('📍 Bridge Contract: ' + ETHEREUM_CONFIG.bridgeContract);
    console.log('🌐 RPC Endpoint: ' + ETHEREUM_CONFIG.rpcUrl);
    
    const [usdcData, usdtData, ethData, lastSequence] = await Promise.all([
      fetchTokenBalance('USDC', ETHEREUM_CONFIG.tokens.USDC.address),
      fetchTokenBalance('USDT', ETHEREUM_CONFIG.tokens.USDT.address),
      fetchNativeBalance('ETH'),
      fetchLastReceivedSequence(),
    ]);

    const ethereumData = {
      balances: {
        USDC: formatTokenValue(usdcData, 6),
        USDT: formatTokenValue(usdtData, 6),
        ETH: formatTokenValue(ethData, 18),
      },
      lastSequence: lastSequence,
      status: 'online',
    };

    console.log('✅ Ethereum data fetched:', ethereumData);
    console.log('========== END ETHEREUM DATA FETCH ==========\n');
    return ethereumData;
  } catch (error) {
    console.error('❌ Error fetching Ethereum data:', error);
    return {
      balances: {
        USDC: 'N/A',
        USDT: 'N/A',
        ETH: 'N/A',
      },
      lastSequence: 'N/A',
      status: 'error',
    };
  }
};

const fetchTokenBalance = async (tokenName, tokenAddress) => {
  try {
    console.log('\n📝 Fetching ' + tokenName + ' Balance');
    console.log('   Token Address: ' + tokenAddress);
    console.log('   Bridge Contract: ' + ETHEREUM_CONFIG.bridgeContract);
    
    const encodedAddress = ETHEREUM_CONFIG.bridgeContract.slice(2).padStart(64, '0');
    const data = '0x70a08231' + encodedAddress;
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: tokenAddress,
          data: data
        },
        'latest'
      ],
      id: Date.now()
    };

    console.log('   📤 RPC Request:');
    console.log('      Method: eth_call');
    console.log('      To: ' + payload.params[0].to);
    console.log('      Data: ' + payload.params[0].data);

    const response = await fetch(ETHEREUM_CONFIG.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('HTTP Error: ' + response.status + ' ' + response.statusText);
    }

    const result = await response.json();
    
    console.log('   📥 RPC Response:');
    console.log('      Hex: ' + result.result);
    console.log('      Decimal: ' + BigInt(result.result).toString());

    if (result.error) {
      throw new Error('RPC Error: ' + result.error.message);
    }

    if (!result.result) {
      throw new Error('No result in RPC response for ' + tokenName);
    }

    const balance = BigInt(result.result).toString();
    console.log('   ✅ ' + tokenName + ' Balance (raw): ' + balance);
    
    return balance;
  } catch (error) {
    console.error('   ❌ Error fetching ' + tokenName + ' balance:', error);
    return 'N/A';
  }
};

const fetchNativeBalance = async (tokenName) => {
  try {
    console.log('\n📝 Fetching ' + tokenName + ' (Native) Balance');
    console.log('   Address: ' + ETHEREUM_CONFIG.bridgeContract);
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [
        ETHEREUM_CONFIG.bridgeContract,
        'latest'
      ],
      id: Date.now()
    };

    console.log('   📤 RPC Request:');
    console.log('      Method: eth_getBalance');
    console.log('      Address: ' + payload.params[0]);

    const response = await fetch(ETHEREUM_CONFIG.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('HTTP Error: ' + response.status + ' ' + response.statusText);
    }

    const result = await response.json();

    console.log('   📥 RPC Response:');
    console.log('      Hex: ' + result.result);
    console.log('      Decimal: ' + BigInt(result.result).toString());

    if (result.error) {
      throw new Error('RPC Error: ' + result.error.message);
    }

    if (!result.result) {
      throw new Error('No result in RPC response for ' + tokenName);
    }

    const balance = BigInt(result.result).toString();
    console.log('   ✅ ' + tokenName + ' Balance (raw): ' + balance);
    
    return balance;
  } catch (error) {
    console.error('   ❌ Error fetching ' + tokenName + ' balance:', error);
    return 'N/A';
  }
};

const fetchLastReceivedSequence = async () => {
  try {
    console.log('\n📝 Fetching Last Received Sequence Number');
    console.log('   Bridge Contract: ' + ETHEREUM_CONFIG.bridgeManagerContract);
    
    const payload = {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [
        {
          to: ETHEREUM_CONFIG.bridgeManagerContract,
          data: GET_LAST_SEQUENCE_SIGNATURE
        },
        'latest'
      ],
      id: Date.now()
    };

    console.log('   📤 RPC Request:');
    console.log('      Method: eth_call');
    console.log('      Function: getLastReceivedSequence()');

    const response = await fetch(ETHEREUM_CONFIG.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('HTTP Error: ' + response.status + ' ' + response.statusText);
    }

    const result = await response.json();
    
    console.log('   📥 RPC Response:');
    console.log('      Hex: ' + result.result);

    if (result.error) {
      console.error('   ❌ RPC Error:', result.error.message);
      return 'N/A';
    }

    if (!result.result || result.result === '0x') {
      console.log('   ⚠️  No sequence number found');
      return '0';
    }

    const sequence = BigInt(result.result).toString();
    console.log('   ✅ Last Sequence Number: ' + sequence);
    
    return sequence;
  } catch (error) {
    console.error('   ❌ Error fetching last sequence:', error);
    return 'N/A';
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