import axios from 'axios';
import { API_ENDPOINTS, ERROR_MESSAGES } from '../utils/constants';
import { retryWithBackoff } from '../utils/helpers';

/**
 * Base API configuration
 */
const createApiInstance = (baseURL, timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000) => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('API Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      console.log(`API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('API Response Error:', error);
      
      // Handle common error cases
      if (error.code === 'ECONNABORTED') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            throw new Error(data?.message || 'Bad request');
          case 401:
            throw new Error('Unauthorized access');
          case 403:
            throw new Error('Forbidden access');
          case 404:
            throw new Error('Resource not found');
          case 429:
            throw new Error('Too many requests. Please try again later.');
          case 500:
            throw new Error('Internal server error');
          case 502:
          case 503:
          case 504:
            throw new Error('Service temporarily unavailable');
          default:
            throw new Error(data?.message || ERROR_MESSAGES.API_ERROR);
        }
      }
      
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  );

  return instance;
};

/**
 * API instances for different services
 */
export const aleoApi = createApiInstance(API_ENDPOINTS.ALEO_BASE_URL);

/**
 * Generic API request wrapper with retry logic
 */
export const apiRequest = async (requestFn, maxRetries = parseInt(import.meta.env.VITE_MAX_RETRIES) || 3) => {
  try {
    return await retryWithBackoff(requestFn, maxRetries);
  } catch (error) {
    console.error('API Request failed after retries:', error);
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = async (url, config = {}) => {
  const response = await aleoApi.get(url, config);
  return response.data;
};

/**
 * POST request helper
 */
export const apiPost = async (url, data = {}, config = {}) => {
  const response = await aleoApi.post(url, data, config);
  return response.data;
};

/**
 * Helper to make direct fetch requests (for non-standard APIs)
 */
export const fetchRequest = async (url, options = {}) => {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: parseInt(import.meta.env.VITE_FETCH_TIMEOUT) || 15000,
    ...options,
  };

  console.log(`Fetching: ${url}`);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), defaultOptions.timeout);
    
    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Response status: ${response.status} for ${url}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Response data:`, data);
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - API took too long to respond');
    }
    console.error('Fetch request error:', error);
    throw error;
  }
};

/**
 * Health check for API endpoints
 */
export const healthCheck = async (url) => {
  try {
    const timeout = parseInt(import.meta.env.VITE_HEALTH_CHECK_TIMEOUT) || 5000;
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  aleoApi,
  apiRequest,
  apiGet,
  apiPost,
  fetchRequest,
  healthCheck,
};