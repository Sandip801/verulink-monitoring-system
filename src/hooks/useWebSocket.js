import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * WebSocket connection states
 */
const WS_STATES = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
};

/**
 * Custom hook for WebSocket connections
 * @param {string} url - WebSocket URL
 * @param {Object} options - Configuration options
 * @returns {Object} WebSocket state and methods
 */
export const useWebSocket = (url, options = {}) => {
  const {
    protocols = [],
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen = null,
    onClose = null,
    onError = null,
    onMessage = null,
  } = options;

  const [connectionState, setConnectionState] = useState(WS_STATES.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    if (!isMountedRef.current || !url) return;

    try {
      setConnectionState(WS_STATES.CONNECTING);
      setError(null);

      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      ws.onopen = (event) => {
        if (!isMountedRef.current) return;
        
        setConnectionState(WS_STATES.CONNECTED);
        reconnectAttemptsRef.current = 0;
        
        if (onOpen) {
          onOpen(event);
        }
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;
        
        setConnectionState(WS_STATES.DISCONNECTED);
        wsRef.current = null;
        
        if (onClose) {
          onClose(event);
        }

        // Attempt reconnection if enabled and not a clean close
        if (reconnect && !event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };

      ws.onerror = (event) => {
        if (!isMountedRef.current) return;
        
        setConnectionState(WS_STATES.ERROR);
        setError('WebSocket connection error');
        
        if (onError) {
          onError(event);
        }
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          setLastMessage({ data, timestamp: new Date() });
          
          if (onMessage) {
            onMessage(data);
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
          setLastMessage({ data: event.data, timestamp: new Date() });
          
          if (onMessage) {
            onMessage(event.data);
          }
        }
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setConnectionState(WS_STATES.ERROR);
      setError(err.message);
    }
  }, [url, protocols, reconnect, reconnectInterval, maxReconnectAttempts, onOpen, onClose, onError, onMessage]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
    
    setConnectionState(WS_STATES.DISCONNECTED);
  }, []);

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        wsRef.current.send(messageStr);
        return true;
      } catch (err) {
        console.error('Error sending WebSocket message:', err);
        setError(err.message);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, []);

  /**
   * Manual reconnect
   */
  const reconnectManually = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (url) {
      connect();
    }
  }, [url, connect]);

  return {
    connectionState,
    lastMessage,
    error,
    isConnected: connectionState === WS_STATES.CONNECTED,
    isConnecting: connectionState === WS_STATES.CONNECTING,
    reconnectAttempts: reconnectAttemptsRef.current,
    connect,
    disconnect,
    sendMessage,
    reconnect: reconnectManually,
  };
};

/**
 * Hook for subscribing to specific WebSocket channels/topics
 * @param {string} url - WebSocket URL
 * @param {Array} channels - Array of channels to subscribe to
 * @param {Object} options - Configuration options
 * @returns {Object} WebSocket state and channel-specific data
 */
export const useWebSocketSubscription = (url, channels = [], options = {}) => {
  const [channelData, setChannelData] = useState({});
  const subscribedChannelsRef = useRef(new Set());

  const handleMessage = useCallback((message) => {
    // Assuming messages have a 'channel' property
    if (message && message.channel) {
      setChannelData(prev => ({
        ...prev,
        [message.channel]: {
          data: message.data,
          timestamp: new Date(),
        }
      }));
    }
  }, []);

  const ws = useWebSocket(url, {
    ...options,
    onMessage: handleMessage,
  });

  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback((channel) => {
    if (ws.isConnected && !subscribedChannelsRef.current.has(channel)) {
      const subscribeMessage = {
        action: 'subscribe',
        channel: channel,
      };
      
      if (ws.sendMessage(subscribeMessage)) {
        subscribedChannelsRef.current.add(channel);
      }
    }
  }, [ws.isConnected, ws.sendMessage]);

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback((channel) => {
    if (ws.isConnected && subscribedChannelsRef.current.has(channel)) {
      const unsubscribeMessage = {
        action: 'unsubscribe',
        channel: channel,
      };
      
      if (ws.sendMessage(unsubscribeMessage)) {
        subscribedChannelsRef.current.delete(channel);
        setChannelData(prev => {
          const updated = { ...prev };
          delete updated[channel];
          return updated;
        });
      }
    }
  }, [ws.isConnected, ws.sendMessage]);

  // Subscribe to initial channels when connected
  useEffect(() => {
    if (ws.isConnected) {
      channels.forEach(channel => {
        subscribe(channel);
      });
    }
  }, [ws.isConnected, channels, subscribe]);

  // Clean up subscriptions on disconnect
  useEffect(() => {
    if (!ws.isConnected) {
      subscribedChannelsRef.current.clear();
      setChannelData({});
    }
  }, [ws.isConnected]);

  return {
    ...ws,
    channelData,
    subscribedChannels: Array.from(subscribedChannelsRef.current),
    subscribe,
    unsubscribe,
  };
};

/**
 * Hook for real-time bridge data updates via WebSocket
 * @param {Object} options - Configuration options
 * @returns {Object} Real-time bridge data
 */
export const useBridgeWebSocket = (options = {}) => {
  const [bridgeData, setBridgeData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [networkStatus, setNetworkStatus] = useState({});

  // This would be the actual WebSocket URL for bridge updates
  const wsUrl = options.wsUrl || null; // Set to null since we don't have a real WebSocket endpoint

  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case 'bridge_update':
        setBridgeData(message.data);
        break;
      case 'price_update':
        setPriceData(message.data);
        break;
      case 'network_status':
        setNetworkStatus(prev => ({
          ...prev,
          [message.network]: message.status,
        }));
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  const ws = useWebSocket(wsUrl, {
    ...options,
    onMessage: handleMessage,
  });

  return {
    ...ws,
    bridgeData,
    priceData,
    networkStatus,
  };
};

export default useWebSocket;