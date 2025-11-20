import { useState, useEffect, useCallback, useRef } from 'react';
import AleoChainService from '../services/chainServices/AleoChainService';
import EthereumChainService from '../services/chainServices/EthereumChainService';
import { REFRESH_CONFIG } from '../config/chainConfig';

/**
 * Format token value with decimals
 */
export const formatTokenValue = (value, decimals = 6, maxDecimals = 2) => {
  if (!value || value === '0') return '0.00';

  try {
    const bigValue = BigInt(value);
    const divisor = BigInt(10 ** decimals);
    
    const whole = bigValue / divisor;
    const fraction = bigValue % divisor;
    
    const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const truncated = fractionStr.slice(0, maxDecimals).replace(/0+$/, '');
    
    return truncated ? `${wholeStr}.${truncated}` : wholeStr;
  } catch (error) {
    console.error('Format error:', error);
    return '0.00';
  }
};

/**
 * Multi-chain data hook
 */
export const useChainData = () => {
  const [chainData, setChainData] = useState({
    aleo: {
      tokens: {},
      timestamp: null,
      status: 'idle',
      error: null,
      health: { status: 'unknown', healthy: false }
    },
    ethereum: {
      tokens: {},
      timestamp: null,
      status: 'idle',
      error: null,
      health: { status: 'unknown', healthy: false }
    }
  });

  const [formattedData, setFormattedData] = useState({
    aleo: {},
    ethereum: {}
  });

  const intervalRefs = useRef({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Object.values(intervalRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  /**
   * Fetch Aleo chain data
   */
  const fetchAleoData = useCallback(async () => {
    console.log('🟣 Fetching Aleo data...');
    
    if (!isMountedRef.current) return;

    setChainData(prev => ({
      ...prev,
      aleo: { ...prev.aleo, status: 'loading' }
    }));

    try {
      const [suppliesData, health] = await Promise.all([
        AleoChainService.fetchAllTokenSupplies(),
        AleoChainService.checkHealth()
      ]);

      if (!isMountedRef.current) return;

      const formatted = {};
      Object.entries(suppliesData.tokens).forEach(([name, data]) => {
        formatted[name] = {
          ...data,
          formatted: data.value ? formatTokenValue(data.value, 6) : 'N/A'
        };
      });

      setChainData(prev => ({
        ...prev,
        aleo: {
          tokens: suppliesData.tokens,
          timestamp: suppliesData.timestamp,
          status: 'success',
          error: null,
          health
        }
      }));

      setFormattedData(prev => ({
        ...prev,
        aleo: formatted
      }));

      console.log('✅ Aleo data fetched successfully');
    } catch (error) {
      console.error('❌ Aleo fetch error:', error);
      
      if (isMountedRef.current) {
        setChainData(prev => ({
          ...prev,
          aleo: {
            ...prev.aleo,
            status: 'error',
            error: error.message,
            health: { status: 'offline', healthy: false }
          }
        }));
      }
    }
  }, []);

  /**
   * Fetch Ethereum chain data
   */
  const fetchEthereumData = useCallback(async () => {
    console.log('🔴 Fetching Ethereum data...');
    
    if (!isMountedRef.current) return;

    setChainData(prev => ({
      ...prev,
      ethereum: { ...prev.ethereum, status: 'loading' }
    }));

    try {
      const [balancesData, health] = await Promise.all([
        EthereumChainService.fetchAllBalances(),
        EthereumChainService.checkHealth()
      ]);

      if (!isMountedRef.current) return;

      const formatted = {};
      Object.entries(balancesData.tokens).forEach(([name, data]) => {
        const decimals = name === 'ETH' ? 18 : 6;
        formatted[name] = {
          ...data,
          formatted: data.value ? formatTokenValue(data.value, decimals) : 'N/A'
        };
      });

      setChainData(prev => ({
        ...prev,
        ethereum: {
          tokens: balancesData.tokens,
          timestamp: balancesData.timestamp,
          status: 'success',
          error: null,
          health
        }
      }));

      setFormattedData(prev => ({
        ...prev,
        ethereum: formatted
      }));

      console.log('✅ Ethereum data fetched successfully');
    } catch (error) {
      console.error('❌ Ethereum fetch error:', error);
      
      if (isMountedRef.current) {
        setChainData(prev => ({
          ...prev,
          ethereum: {
            ...prev.ethereum,
            status: 'error',
            error: error.message,
            health: { status: 'offline', healthy: false }
          }
        }));
      }
    }
  }, []);

  /**
   * Start polling for a chain
   */
  const startChainPolling = useCallback((chain, interval) => {
    if (intervalRefs.current[chain]) {
      clearInterval(intervalRefs.current[chain]);
    }

    const fetchFn = chain === 'aleo' ? fetchAleoData : fetchEthereumData;
    
    // Fetch immediately
    fetchFn();
    
    // Then poll
    intervalRefs.current[chain] = setInterval(() => {
      if (isMountedRef.current) {
        fetchFn();
      }
    }, interval);
  }, [fetchAleoData, fetchEthereumData]);

  /**
   * Stop polling for a chain
   */
  const stopChainPolling = useCallback((chain) => {
    if (intervalRefs.current[chain]) {
      clearInterval(intervalRefs.current[chain]);
      intervalRefs.current[chain] = null;
    }
  }, []);

  /**
   * Initialize
   */
  useEffect(() => {
    startChainPolling('aleo', REFRESH_CONFIG.ALEO);
    startChainPolling('ethereum', REFRESH_CONFIG.ETHEREUM);

    return () => {
      stopChainPolling('aleo');
      stopChainPolling('ethereum');
    };
  }, [startChainPolling, stopChainPolling]);

  return {
    // Raw chain data
    data: chainData,
    
    // Formatted data for display
    formatted: formattedData,
    
    // Control functions
    refetch: async () => {
      await Promise.all([fetchAleoData(), fetchEthereumData()]);
    },
    
    // Status
    isLoading: chainData.aleo.status === 'loading' || chainData.ethereum.status === 'loading',
    hasError: chainData.aleo.status === 'error' || chainData.ethereum.status === 'error',
  };
};

export default useChainData;