import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic API hook for handling async data fetching
 * @param {Function} apiFunction - Function that returns a Promise
 * @param {Array} dependencies - Dependencies to trigger refetch
 * @param {Object} options - Configuration options
 * @returns {Object} API state and methods
 */
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    retry = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const retryCountRef = useRef(0);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      
      if (!isMountedRef.current) return;
      
      setData(result);
      setLastFetch(new Date());
      retryCountRef.current = 0;
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err) {
      if (!isMountedRef.current) return;
      
      console.error('API call failed:', err);
      
      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current += 1;
        
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            execute(...args);
          }
        }, retryDelay * retryCountRef.current);
        
        return;
      }
      
      setError(err.message || 'An error occurred');
      
      if (onError) {
        onError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, onSuccess, onError, retry, retryDelay]);

  // Auto-execute on mount and dependencies change
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setLastFetch(null);
    retryCountRef.current = 0;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    data,
    loading,
    error,
    lastFetch,
    execute,
    refetch,
    reset,
    retryCount: retryCountRef.current,
  };
};

/**
 * Hook for polling data at regular intervals
 * @param {Function} apiFunction - Function that returns a Promise
 * @param {number} interval - Polling interval in milliseconds
 * @param {Object} options - Configuration options
 * @returns {Object} API state and methods
 */
export const usePolling = (apiFunction, interval = 30000, options = {}) => {
  const { enabled = true, ...apiOptions } = options;
  const intervalRef = useRef(null);
  
  const api = useApi(apiFunction, [], { immediate: enabled, ...apiOptions });

  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(() => {
        api.execute();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, api.execute]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      api.execute();
    }, interval);
  }, [api.execute, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    ...api,
    startPolling,
    stopPolling,
    isPolling: !!intervalRef.current,
  };
};

/**
 * Hook for handling multiple API calls
 * @param {Array} apiCalls - Array of API call objects
 * @param {Object} options - Configuration options
 * @returns {Object} Combined API state
 */
export const useMultipleApi = (apiCalls = [], options = {}) => {
  const { immediate = true } = options;
  
  const [loading, setLoading] = useState(immediate);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({});
  const [lastFetch, setLastFetch] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setErrors({});
    
    const results = await Promise.allSettled(
      apiCalls.map(async (call) => {
        try {
          const result = await call.fn();
          return { key: call.key, data: result, success: true };
        } catch (error) {
          return { key: call.key, error: error.message, success: false };
        }
      })
    );

    const newData = {};
    const newErrors = {};

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { key, data: resultData, error, success } = result.value;
        
        if (success) {
          newData[key] = resultData;
        } else {
          newErrors[key] = error;
        }
      } else {
        console.error('Promise rejected:', result.reason);
      }
    });

    setData(newData);
    setErrors(newErrors);
    setLastFetch(new Date());
    setLoading(false);
  }, [apiCalls]);

  useEffect(() => {
    if (immediate && apiCalls.length > 0) {
      execute();
    }
  }, [immediate, execute]);

  const hasErrors = Object.keys(errors).length > 0;
  const hasData = Object.keys(data).length > 0;

  return {
    data,
    loading,
    errors,
    hasErrors,
    hasData,
    lastFetch,
    execute,
    refetch: execute,
  };
};

export default useApi;