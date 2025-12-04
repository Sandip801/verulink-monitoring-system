export const fetchAleoData = async () => {
  try {
    console.log('🟣 Fetching Aleo data...');
    
    const tokenIds = {
      vUSDC: import.meta.env.VITE_ALEO_VUSDC_FIELD_KEY || '6088188135219746443092391282916151282477828391085949070550825603498725268775field',
      vETH: import.meta.env.VITE_ALEO_VETH_FIELD_KEY || '1381601714105276218895759962490543360839827276760458984912661726715051428034field',
      vUSDT: import.meta.env.VITE_ALEO_VUSDT_FIELD_KEY || '7311977476241952331367670434347097026669181172395481678807963832961201831695field',
    };

    const aleoBaseUrl = import.meta.env.VITE_ALEO_API_URL || 'https://api.explorer.provable.com/v1/mainnet';
    const tokenServiceProgram = import.meta.env.VITE_ALEO_TOKEN_SERVICE_PROGRAM || 'vlink_token_service_v3.aleo';
    const baseUrl = `${aleoBaseUrl}/program/${tokenServiceProgram}/mapping/total_supply`;

    // Fetch all token supplies in parallel
    const [vUSDCRaw, vETHRaw, vUSDTRaw] = await Promise.all([
      fetchTokenSupply(baseUrl, tokenIds.vUSDC, 'vUSDC'),
      fetchTokenSupply(baseUrl, tokenIds.vETH, 'vETH'),
      fetchTokenSupply(baseUrl, tokenIds.vUSDT, 'vUSDT'),
    ]);

    const aleoData = {
      supplies: {
        vUSDC: formatTokenValue(vUSDCRaw, 6),
        vETH: formatTokenValue(vETHRaw, 18),
        vUSDT: formatTokenValue(vUSDTRaw, 6),
      },
      status: 'online',
    };

    console.log('✅ Aleo data fetched:', aleoData);
    return aleoData;
  } catch (error) {
    console.error('❌ Error fetching Aleo data:', error);
    return {
      supplies: {
        vUSDC: 'N/A',
        vETH: 'N/A',
        vUSDT: 'N/A',
      },
      status: 'error',
    };
  }
};

/**
 * Fetch vlink token supply from Aleo side
 * Used for the Aleo to BSC bridge card
 */
export const fetchAleoVlinkSupply = async () => {
  try {
    console.log('🟣 Fetching Aleo vlink token supply...');
    
    // API endpoint for vlink_token_service_cd_v3.aleo program
    const aleoBaseUrl = import.meta.env.VITE_ALEO_API_URL || 'https://api.explorer.provable.com/v1/mainnet';
    const tokenServiceCdProgram = import.meta.env.VITE_ALEO_TOKEN_SERVICE_CD_PROGRAM || 'vlink_token_service_cd_v3.aleo';
    const bscVlinkTokenId = import.meta.env.VITE_BSC_VLINK_TOKEN_ID || '3443843282313283355522573239085696902919850365217539366784739393210722344986field';
    const url = `${aleoBaseUrl}/program/${tokenServiceCdProgram}/mapping/total_supply/{chain_id:422842677816u128, token_id:${bscVlinkTokenId}}`;
    
    console.log('🔗 Fetching from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ API request failed: ${response.status}`);
      return 'N/A';
    }

    const data = await response.json();
    console.log('📥 Aleo vlink supply response:', data);

    // Extract value from response
    let value = null;
    if (data && data.value) {
      value = data.value;
    } else if (data && typeof data === 'string') {
      value = data;
    } else if (data && data.result) {
      value = data.result;
    } else if (data && data.data) {
      value = data.data;
    }

    if (!value) {
      console.warn('⚠️ No value found in vlink supply response:', data);
      return 'N/A';
    }

    console.log('✅ vlink supply raw value:', value);
    return formatTokenValue(value, 6); // 6 decimals for vlink token
  } catch (error) {
    console.error('❌ Error fetching vlink supply:', error);
    return 'N/A';
  }
};

const fetchTokenSupply = async (baseUrl, tokenId, tokenName) => {
  try {
    const url = `${baseUrl}/${tokenId}`;
    console.log(`🔗 Fetching Aleo ${tokenName}:`, url);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ API request failed for ${tokenName}: ${response.status}`);
      return 'N/A';
    }

    const data = await response.json();
    console.log(`📥 Aleo ${tokenName} response:`, data);

    // The API returns different structures, check multiple possibilities
    let value = null;

    // Check if data has a 'value' field
    if (data && data.value) {
      value = data.value;
    }
    // Check if data is directly the value string
    else if (data && typeof data === 'string') {
      value = data;
    }
    // Check if data has 'result' field
    else if (data && data.result) {
      value = data.result;
    }
    // Check if data has 'data' field
    else if (data && data.data) {
      value = data.data;
    }

    if (!value) {
      console.warn(`⚠️ No value found in ${tokenName} response:`, data);
      return 'N/A';
    }

    console.log(`✅ ${tokenName} raw value: ${value}`);
    return value;
  } catch (error) {
    console.error(`❌ Error fetching ${tokenName} supply:`, error);
    return 'N/A';
  }
};

const formatTokenValue = (value, decimals) => {
  if (!value || value === 'N/A') return 'N/A';
  
  if (typeof value !== 'string') {
    console.warn('⚠️ Value is not a string:', value, typeof value);
    return 'N/A';
  }

  // Remove 'u128' or 'u64' suffix if present
  let cleanValue = value.replace(/u(128|64)$/i, '').trim();

  if (cleanValue === '' || isNaN(cleanValue)) {
    console.warn('⚠️ Invalid number format:', value);
    return 'N/A';
  }

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
    console.error('❌ Error formatting token value:', error);
    return value;
  }
};