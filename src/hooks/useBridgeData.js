import { useState, useEffect } from 'react';
import { fetchAleoData, fetchAleoVlinkSupply } from '../services/AleoChainService';
import { fetchEthereumData } from '../services/EthereumChainService';
import { fetchBSCData } from '../services/bscService';

const useBridgeData = () => {
  const [data, setData] = useState(null);
  const [formattedData, setFormattedData] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const formatData = (rawData) => {
    if (!rawData) return null;

    console.log('🎯 Formatting data:', rawData);

    const formatted = {
      aleo: {
        vUSDC: rawData?.aleo?.supplies?.vUSDC || 'N/A',
        vETH: rawData?.aleo?.supplies?.vETH || 'N/A',
        vUSDT: rawData?.aleo?.supplies?.vUSDT || 'N/A',
      },
      ethereum: {
        USDC: rawData?.ethereum?.balances?.USDC || 'N/A',
        USDT: rawData?.ethereum?.balances?.USDT || 'N/A',
        ETH: rawData?.ethereum?.balances?.ETH || 'N/A',
      },
      bsc: {
        status: rawData?.bsc?.status || 'not_configured',
        data: rawData?.bsc?.totalSupply || 'N/A',
      },
      aleoVlink: {
        supply: rawData?.aleoVlink?.supply || 'N/A',
      },
    };

    console.log('✅ Formatted data ready:', formatted);
    return formatted;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      console.log('🌉 Starting bridge data fetch...');

      const [aleoData, ethereumData, bscData, vlinkSupply] = await Promise.all([
        fetchAleoData(),
        fetchEthereumData(),
        fetchBSCData(),
        fetchAleoVlinkSupply(),
      ]);

      const combinedData = {
        aleo: {
          ...aleoData,
          timestamp: new Date().toISOString(),
        },
        ethereum: {
          ...ethereumData,
          timestamp: new Date().toISOString(),
        },
        bsc: {
          ...bscData,
          timestamp: new Date().toISOString(),
        },
        aleoVlink: {
          supply: vlinkSupply,
          timestamp: new Date().toISOString(),
        },
      };

      console.log('✅ Combined data:', combinedData);

      setData(combinedData);
      const formatted = formatData(combinedData);
      setFormattedData(formatted);

      const healthData = {
        aleo: { status: 'online', healthy: true },
        ethereum: { status: 'online', healthy: true },
        bsc: { status: combinedData?.bsc?.status === 'not_configured' ? 'offline' : 'online', healthy: true },
      };
      setHealth(healthData);
    } catch (error) {
      console.error('❌ Error:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    console.log('🔄 Refetch triggered');
    fetchData();
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    formattedData,
    health,
    isLoading,
    hasError,
    refetch,
  };
};

export default useBridgeData;