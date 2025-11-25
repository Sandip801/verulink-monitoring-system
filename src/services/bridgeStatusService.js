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
 * Fetch ETH token status (token_status mapping)
 * Returns status for each token (0 = paused, 1 = active)
 */
export const fetchEthTokenStatus = async () => {
  try {
    console.log('🟣 Fetching ETH token status...');

    const tokenIds = {
      vUSDC: '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
      vETH: '1381601714105276218895759962490543360839827276760458984912661726715051428034field',
      vUSDT: '7311977476241952331367670434347097026669181172395481678807963832961201831695field',
    };

    const baseUrl = 'https://api.explorer.provable.com/v1/mainnet/program/vlink_token_service_v3.aleo/mapping/token_status';

    const results = {};

    // Fetch all token statuses in parallel
    const requests = Object.entries(tokenIds).map(async ([tokenName, tokenId]) => {
      try {
        const url = `${baseUrl}/${tokenId}`;
        console.log(`🔗 Fetching ETH ${tokenName} status:`, url);

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`❌ API request failed for ${tokenName}: ${response.status}`);
          return { tokenName, status: 'unknown', isPaused: null };
        }

        const data = await response.json();
        console.log(`📥 ETH ${tokenName} status response:`, data);

        // Parse the status value
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

        // Clean value and determine if paused
        let cleanValue = statusValue?.toString().replace(/u8$/i, '').trim();
        const isPaused = cleanValue === '0';

        return {
          tokenName,
          status: isPaused ? 'paused' : 'active',
          isPaused,
          raw: statusValue,
        };
      } catch (error) {
        console.error(`❌ Error fetching ${tokenName} status:`, error);
        return { tokenName, status: 'error', isPaused: null, error: error.message };
      }
    });

    const tokenStatuses = await Promise.all(requests);
    
    // Format results
    tokenStatuses.forEach(({ tokenName, status, isPaused, raw, error }) => {
      results[tokenName] = { status, isPaused, raw, error };
    });

    return results;
  } catch (error) {
    console.error('❌ Error fetching ETH token statuses:', error);
    return { error: error.message };
  }
};

/**
 * Fetch BSC token status from vlink_token_service_cd_v3.aleo
 * Returns status for the vlink token (0 = paused, 1 = active)
 */
export const fetchBscTokenStatus = async () => {
  try {
    console.log('🟣 Fetching BSC token status...');

    const url = 'https://api.explorer.provable.com/v1/mainnet/program/vlink_token_service_cd_v3.aleo/mapping/status/{chain_id: 422842677816u128, token_id: 3443843282313283355522573239085696902919850365217539366784739393210722344986field}';
    
    console.log('🔗 Fetching from:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status}`);
      return { status: 'unknown', isPaused: null };
    }

    const data = await response.json();
    console.log('📥 BSC token status response:', data);

    // Parse the status value
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

    // Clean value and determine if paused
    let cleanValue = statusValue?.toString().replace(/u8$/i, '').trim();
    const isPaused = cleanValue === '0';

    return {
      status: isPaused ? 'paused' : 'active',
      isPaused,
      raw: statusValue,
    };
  } catch (error) {
    console.error('❌ Error fetching BSC token status:', error);
    return { status: 'error', isPaused: null, error: error.message };
  }
};

/**
 * Fetch all bridge statuses in parallel
 */
export const fetchAllBridgeStatuses = async () => {
  try {
    console.log('🟣 Fetching all bridge statuses...');
    
    const [bridgeSettings, ethTokenStatus, bscTokenStatus] = await Promise.all([
      fetchAleoBridgeSettings(),
      fetchEthTokenStatus(),
      fetchBscTokenStatus(),
    ]);

    return {
      bridgeSettings,
      ethTokenStatus,
      bscTokenStatus,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error fetching all bridge statuses:', error);
    return { error: error.message };
  }
};
