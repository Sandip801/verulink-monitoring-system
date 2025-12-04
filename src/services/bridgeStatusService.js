import { ethers } from 'ethers';

const DEFAULT_ETH_RPC = import.meta.env.VITE_ETH_RPC_URL || 'https://eth.llamarpc.com';
const DEFAULT_BSC_RPC = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
let ethProvider = null;
let bscProvider = null;

const getEthProvider = () => {
  if (!ethProvider) {
    const rpcUrl = import.meta?.env?.VITE_ETH_RPC_URL || DEFAULT_ETH_RPC;
    ethProvider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return ethProvider;
};

const getBscProvider = () => {
  if (!bscProvider) {
    const rpcUrl = import.meta?.env?.VITE_BSC_RPC_URL || DEFAULT_BSC_RPC;
    bscProvider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return bscProvider;
};

const ETH_BRIDGE_CONTRACT = import.meta.env.VITE_ETH_BRIDGE_CONTRACT || '0x7440176A6F367D3Fad1754519bD8033EAF173133';
const ETH_TOKEN_MANAGER_CONTRACT = import.meta.env.VITE_ETH_TOKEN_MANAGER_CONTRACT || '0x28E761500e7Fd17b5B0A21a1eAD29a8E22D73170';
const BSC_BRIDGE_CONTRACT = import.meta.env.VITE_BSC_BRIDGE_CONTRACT || '0x397e47f5072b48681b170199551bdb7fbda136b7';
const BSC_VLINK_TOKEN_ID = import.meta.env.VITE_BSC_VLINK_TOKEN_ID || '3443843282313283355522573239085696902919850365217539366784739393210722344986field';
const ETH_TOKENS = {
  USDC: (import.meta.env.VITE_ETH_USDC_ADDRESS || '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48').toLowerCase(),
  USDT: (import.meta.env.VITE_ETH_USDT_ADDRESS || '0xdac17f958d2ee523a2206206994597c13d831ec7').toLowerCase(),
  ETH: '0x0000000000000000000000000000000000000001',
};

/**
 * Fetch Aleo Bridge Settings
 * Returns 0u8 if bridge is paused, 1u8 if active
 */
export const fetchAleoBridgeSettings = async () => {
  try {
    console.log('🟣 Fetching Aleo bridge settings...');
    const aleoBaseUrl = import.meta.env.VITE_ALEO_API_URL || 'https://api.explorer.provable.com/v1/mainnet';
    const bridgeProgram = import.meta.env.VITE_ALEO_TOKEN_BRIDGE_PROGRAM || 'vlink_token_bridge_v3.aleo';
    const url = `${aleoBaseUrl}/program/${bridgeProgram}/mapping/bridge_settings/3u8`;
    
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
      vUSDC: import.meta.env.VITE_ALEO_VUSDC_FIELD_KEY || '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
      vETH: import.meta.env.VITE_ALEO_VETH_FIELD_KEY || '1381601714105276218895759962490543360839827276760458984912661726715051428034field',
      vUSDT: import.meta.env.VITE_ALEO_VUSDT_FIELD_KEY || '7311977476241952331367670434347097026669181172395481678807963832961201831695field',
    };

    const aleoBaseUrl = import.meta.env.VITE_ALEO_API_URL || 'https://api.explorer.provable.com/v1/mainnet';
    const tokenServiceProgram = import.meta.env.VITE_ALEO_TOKEN_SERVICE_PROGRAM || 'vlink_token_service_v3.aleo';
    const baseUrl = `${aleoBaseUrl}/program/${tokenServiceProgram}/mapping/token_status`;

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
    const provider = getEthProvider();

    // Function signature: isEnabledToken(address)
    const functionSignature = 'isEnabledToken(address)';
    const encodedSelector = ethers.id(functionSignature).slice(0, 10);

    const results = {};

    const requests = Object.entries(ETH_TOKENS).map(async ([tokenName, tokenAddress]) => {
      try {
        // Encode the function call
        const encoded = encodedSelector + ethers.AbiCoder.defaultAbiCoder()
          .encode(['address'], [tokenAddress])
          .slice(2);

        // Make the call
        const response = await provider.call({
          to: ETH_TOKEN_MANAGER_CONTRACT,
          data: encoded,
        });

        // Decode the response
        const [isEnabled] = ethers.AbiCoder.defaultAbiCoder()
          .decode(['bool'], response);

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
    console.log('🡡 Fetching BSC bridge status...');
    const provider = getBscProvider();

    // Function signature: paused()
    const functionSignature = 'paused()';
    const encodedSelector = ethers.id(functionSignature).slice(0, 10);

    const response = await provider.call({
      to: BSC_BRIDGE_CONTRACT,
      data: encodedSelector,
    });

    // Decode the response
    const [isPaused] = ethers.AbiCoder.defaultAbiCoder()
      .decode(['bool'], response);

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
    console.log('🡡 Fetching BSC token status from Aleo mapping...');

    const aleoBaseUrl = import.meta.env.VITE_ALEO_API_URL || 'https://api.explorer.provable.com/v1/mainnet';
    const tokenServiceCdProgram = import.meta.env.VITE_ALEO_TOKEN_SERVICE_CD_PROGRAM || 'vlink_token_service_cd_v3.aleo';
    const url = `${aleoBaseUrl}/program/${tokenServiceCdProgram}/mapping/status/{chain_id: 422842677816u128, token_id: ${BSC_VLINK_TOKEN_ID}}`;

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
    const provider = getEthProvider();

    // Function signature: paused()
    const functionSignature = 'paused()';
    const encodedSelector = ethers.id(functionSignature).slice(0, 10);

    const response = await provider.call({
      to: ETH_BRIDGE_CONTRACT,
      data: encodedSelector,
    });

    // Decode the response
    const [isPaused] = ethers.AbiCoder.defaultAbiCoder()
      .decode(['bool'], response);

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