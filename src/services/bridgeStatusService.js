import Web3 from 'web3';

const DEFAULT_ETH_RPC = 'https://eth.llamarpc.com';
const DEFAULT_BSC_RPC = 'https://bsc-dataseed.binance.org';
let ethWeb3Instance = null;
let bscWeb3Instance = null;

const getEthWeb3 = () => {
  if (!ethWeb3Instance) {
    const rpcUrl = import.meta?.env?.VITE_ETH_RPC_URL || DEFAULT_ETH_RPC;
    ethWeb3Instance = new Web3(rpcUrl);
  }
  return ethWeb3Instance;
};

const getBscWeb3 = () => {
  if (!bscWeb3Instance) {
    const rpcUrl = import.meta?.env?.VITE_BSC_RPC_URL || DEFAULT_BSC_RPC;
    bscWeb3Instance = new Web3(rpcUrl);
  }
  return bscWeb3Instance;
};

const ETH_BRIDGE_CONTRACT = '0x7440176A6F367D3Fad1754519bD8033EAF173133';
const ETH_TOKEN_MANAGER_CONTRACT = '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170';
const BSC_BRIDGE_CONTRACT = '0x397e47f5072b48681b170199551bdb7fbda136b7';
const BSC_VLINK_TOKEN_ID = '3443843282313283355522573239085696902919850365217539366784739393210722344986field';
const ETH_TOKENS = {
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  ETH: '0x0000000000000000000000000000000000000001',
};

/**
 * Fetch Aleo Bridge Settings
 * Returns 0u8 if bridge is paused, 1u8 if active
 */
export const fetchAleoBridgeSettings = async () => {
  try {
    console.log('🟣 Fetching Aleo bridge settings...');
    const url = 'https://api.explorer.provable.com/v1/mainnet/program/vlink_token_bridge_v3.aleo/mapping/bridge_settings/3u8';
    
    console.log('🔗 Fetching from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status}`);
      return { status: 'unknown', raw: null };
    }

    const data = await response.json();
    console.log('📥 Bridge settings response:', data);

    // Parse the status
    let statusValue = null;
    if (data && data.value) {
      statusValue = data.value;
    } else if (typeof data === 'string') {
      statusValue = data;
    } else if (data && data.result) {
      statusValue = data.result;
    } else if (data && data.data) {
      statusValue = data.data;
    }

    // Clean the value (remove u8 suffix)
    let cleanValue = statusValue?.toString().replace(/u8$/i, '').trim();
    
    return {
      status: cleanValue === '1' ? 'active' : 'paused',
      raw: statusValue,
      isPaused: cleanValue === '0',
    };
  } catch (error) {
    console.error('❌ Error fetching bridge settings:', error);
    return { status: 'error', raw: null, error: error.message };
  }
};

/**
 * Fetch Aleo token status (token_status mapping)
 * Returns status for each token (0 = paused, 1 = active)
 */
export const fetchAleoTokenStatus = async () => {
  try {
    console.log('🟣 Fetching Aleo token status...');

    const tokenIds = {
      vUSDC: '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
      vETH: '1381601714105276218895759962490543360839827276760458984912661726715051428034field',
      vUSDT: '7311977476241952331367670434347097026669181172395481678807963832961201831695field',
    };

    const baseUrl = 'https://api.explorer.provable.com/v1/mainnet/program/vlink_token_service_v3.aleo/mapping/token_status';

    const results = {};

    const requests = Object.entries(tokenIds).map(async ([tokenName, tokenId]) => {
      try {
        const url = `${baseUrl}/${tokenId}`;
        console.log(`🔗 Fetching Aleo ${tokenName} status:`, url);

        const response = await fetch(url);

        if (!response.ok) {
          console.error(`❌ API request failed for ${tokenName}: ${response.status}`);
          return { tokenName, status: 'unknown', isPaused: null };
        }

        const data = await response.json();
        console.log(`📥 Aleo ${tokenName} status response:`, data);

        let statusValue = null;
        if (data && data.value) {
          statusValue = data.value;
        } else if (typeof data === 'string') {
          statusValue = data;
        } else if (data && data.result) {
          statusValue = data.result;
        } else if (data && data.data) {
          statusValue = data.data;
        }

        let cleanValue = statusValue?.toString().replace(/u8$/i, '').trim();
        const isPaused = cleanValue === '0';

        return {
          tokenName,
          tokenId,
          status: isPaused ? 'paused' : 'active',
          isPaused,
          raw: statusValue,
        };
      } catch (error) {
        console.error(`❌ Error fetching Aleo ${tokenName} status:`, error);
        return { tokenName, status: 'error', isPaused: null, error: error.message };
      }
    });

    const tokenStatuses = await Promise.all(requests);

    tokenStatuses.forEach(({ tokenName, tokenId, status, isPaused, raw, error }) => {
      results[tokenName] = { status, isPaused, raw, error };
      if (tokenId) {
        results[tokenName].tokenId = tokenId;
      }
    });

    return results;
  } catch (error) {
    console.error('❌ Error fetching Aleo token statuses:', error);
    return { error: error.message };
  }
};

/**
 * Fetch ETH token availability from on-chain contract
 */
export const fetchEthTokenAvailability = async () => {
  try {
    console.log('🟣 Fetching ETH token availability...');
    const web3 = getEthWeb3();

    const methodAbi = {
      name: 'isEnabledToken',
      type: 'function',
      inputs: [{ name: 'token', type: 'address' }],
      outputs: [{ type: 'bool' }],
      stateMutability: 'view',
    };

    const results = {};

    const requests = Object.entries(ETH_TOKENS).map(async ([tokenName, tokenAddress]) => {
      try {
        const data = web3.eth.abi.encodeFunctionCall(methodAbi, [tokenAddress]);
        const response = await web3.eth.call({
          to: ETH_TOKEN_MANAGER_CONTRACT,
          data,
        });

        const isEnabled = web3.eth.abi.decodeParameter('bool', response);

        return {
          tokenName,
          tokenAddress,
          isEnabled,
        };
      } catch (error) {
        console.error(`❌ Error fetching availability for ${tokenName}:`, error);
        return {
          tokenName,
          tokenAddress,
          isEnabled: null,
          error: error.message,
        };
      }
    });

    const tokenStatuses = await Promise.all(requests);
    tokenStatuses.forEach(({ tokenName, tokenAddress, isEnabled, error }) => {
      results[tokenName] = {
        tokenAddress,
        isEnabled,
        status: isEnabled === null ? 'unknown' : isEnabled ? 'available' : 'unavailable',
        error,
      };
    });

    return results;
  } catch (error) {
    console.error('❌ Error fetching ETH token availability:', error);
    return { error: error.message };
  }
};

/**
 * Fetch BSC bridge status directly from on-chain contract
 */
export const fetchBscBridgeStatus = async () => {
  try {
    console.log('🟡 Fetching BSC bridge status...');
    const web3 = getBscWeb3();

    const pausedAbi = {
      name: 'paused',
      type: 'function',
      inputs: [],
      outputs: [{ type: 'bool' }],
      stateMutability: 'view',
    };

    const data = web3.eth.abi.encodeFunctionCall(pausedAbi, []);
    const response = await web3.eth.call({
      to: BSC_BRIDGE_CONTRACT,
      data,
    });

    const isPaused = web3.eth.abi.decodeParameter('bool', response);

    return {
      status: isPaused ? 'paused' : 'active',
      isPaused,
    };
  } catch (error) {
    console.error('❌ Error fetching BSC bridge status:', error);
    return { status: 'error', isPaused: null, error: error.message };
  }
};

/**
 * Fetch BSC token status from Aleo mapping (historical source)
 */
export const fetchBscTokenStatus = async () => {
  try {
    console.log('🟡 Fetching BSC token status from Aleo mapping...');

    const url = `https://api.explorer.provable.com/v1/mainnet/program/vlink_token_service_cd_v3.aleo/mapping/status/{chain_id: 422842677816u128, token_id: ${BSC_VLINK_TOKEN_ID}}`;

    console.log('🔗 Fetching from:', url);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status}`);
      return { status: 'unknown', isPaused: null };
    }

    const data = await response.json();
    console.log('📥 BSC token status response:', data);

    let statusValue = null;
    if (data && data.value) {
      statusValue = data.value;
    } else if (typeof data === 'string') {
      statusValue = data;
    } else if (data && data.result) {
      statusValue = data.result;
    } else if (data && data.data) {
      statusValue = data.data;
    }

    let cleanValue = statusValue?.toString().replace(/u8$/i, '').trim();
    const isPaused = cleanValue === '0';

    return {
      status: isPaused ? 'paused' : 'active',
      isPaused,
      raw: statusValue,
      tokenId: BSC_VLINK_TOKEN_ID,
    };
  } catch (error) {
    console.error('❌ Error fetching BSC token status:', error);
    return { status: 'error', isPaused: null, error: error.message };
  }
};

/**
 * Fetch ETH bridge paused status from on-chain contract
 */
export const fetchEthBridgeStatus = async () => {
  try {
    console.log('🔴 Fetching ETH bridge paused status...');
    const web3 = getEthWeb3();

    const pausedAbi = {
      name: 'paused',
      type: 'function',
      inputs: [],
      outputs: [{ type: 'bool' }],
      stateMutability: 'view',
    };

    const data = web3.eth.abi.encodeFunctionCall(pausedAbi, []);
    const response = await web3.eth.call({
      to: ETH_BRIDGE_CONTRACT,
      data,
    });

    const isPaused = web3.eth.abi.decodeParameter('bool', response);

    return {
      status: isPaused ? 'paused' : 'active',
      isPaused,
    };
  } catch (error) {
    console.error('❌ Error fetching ETH bridge status:', error);
    return { status: 'error', isPaused: null, error: error.message };
  }
};

/**
 * Fetch all bridge statuses in parallel
 */
export const fetchAllBridgeStatuses = async () => {
  try {
    console.log('🟣 Fetching all bridge statuses...');
    
    const [
      bridgeSettings,
      ethBridgeStatus,
      aleoTokenStatus,
      ethTokenAvailability,
      bscBridgeStatus,
      bscTokenStatus,
    ] = await Promise.all([
      fetchAleoBridgeSettings(),
      fetchEthBridgeStatus(),
      fetchAleoTokenStatus(),
      fetchEthTokenAvailability(),
      fetchBscBridgeStatus(),
      fetchBscTokenStatus(),
    ]);

    return {
      bridgeSettings,
      ethBridgeStatus,
      aleoTokenStatus,
      ethTokenAvailability,
      bscBridgeStatus,
      bscTokenStatus,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error fetching all bridge statuses:', error);
    return { error: error.message };
  }
};
