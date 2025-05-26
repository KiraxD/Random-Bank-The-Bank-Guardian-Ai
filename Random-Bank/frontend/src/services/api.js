import axios from 'axios';

// Create axios instance with more resilient configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout to handle slow connections
  timeout: 15000, // Extended timeout for better reliability
  // Retry logic for failed requests
  retry: 5, // Increased retries
  retryDelay: 1000
});

// Maintain a connection state
const connectionState = {
  isConnected: true,
  lastConnectedTime: Date.now(),
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  cachedResponses: {},
  pendingRequests: []
};

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add retry logic for network errors
api.interceptors.response.use(
  (response) => {
    // Update connection state when we get a successful response
    connectionState.isConnected = true;
    connectionState.lastConnectedTime = Date.now();
    connectionState.reconnectAttempts = 0;

    // Cache successful responses for critical endpoints
    const url = response.config.url;
    if (url.includes('/auth/profile') || url.includes('/transactions')) {
      connectionState.cachedResponses[url] = {
        data: response.data,
        timestamp: Date.now()
      };
    }

    return response;
  },
  async (error) => {
    const { config } = error;
    
    // If config does not exist or retry option is not set, reject
    if (!config || !config.retry) {
      return Promise.reject(error);
    }
    
    // Set the variable for keeping track of the retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Check if we've maxed out the total number of retries
    if (config.__retryCount >= config.retry) {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response && error.response.status === 401) {
        // Clear local storage
        localStorage.removeItem('token');
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Handle network errors with fallback mechanisms
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('Network error detected, server may be unavailable');
        connectionState.isConnected = false;
        connectionState.reconnectAttempts++;

        // Check if we have a cached response for this URL
        const cachedResponse = connectionState.cachedResponses[config.url];
        const cacheMaxAge = 5 * 60 * 1000; // 5 minutes

        // Use cached data if available and not too old
        if (cachedResponse && (Date.now() - cachedResponse.timestamp) < cacheMaxAge) {
          console.log(`Using cached response for ${config.url}`);
          return Promise.resolve({
            data: cachedResponse.data,
            __fromCache: true
          });
        }
        
        // Use a mock response for authentication in development mode
        if (config.url.includes('/auth/') && process.env.NODE_ENV === 'development') {
          console.log('Using mock authentication data for development');
          if (config.url.includes('/login')) {
            return Promise.resolve({
              data: {
                accessToken: 'mock-token',
                user: { id: 1, firstName: 'Demo', lastName: 'User', email: 'demo@example.com', balance: 5000 }
              }
            });
          } else if (config.url.includes('/profile')) {
            return Promise.resolve({
              data: { id: 1, firstName: 'Demo', lastName: 'User', email: 'demo@example.com', balance: 5000 }
            });
          }
        }

        // For transaction requests, store them to retry later when connection is restored
        if ((config.method === 'post' || config.method === 'put') && 
            (config.url.includes('/transactions') || config.url.includes('/transfer'))) {
          console.log('Storing transaction request for later retry');
          connectionState.pendingRequests.push({
            config,
            timestamp: Date.now()
          });
          
          // Show message to user that the transaction will be processed when connection is restored
          return Promise.reject({
            ...error,
            __customError: true,
            message: 'Your transaction has been saved and will be processed when the connection is restored.'
          });
        }
      }
      
      return Promise.reject(error);
    }
    
    // Increase the retry count
    config.__retryCount += 1;
    
    // Create new promise to handle exponential backoff
    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Retry attempt #${config.__retryCount} for ${config.url}`);
        resolve();
      }, config.retryDelay || 1000);
    });
    
    // Return the promise in which recalls axios to retry the request
    await backoff;
    return api(config);
  }
);

// Add a function to check connectivity and process pending requests
const checkConnectivity = async () => {
  try {
    // Try to ping the server
    const response = await fetch(`${api.defaults.baseURL}/health`, { method: 'GET', timeout: 3000 });
    
    if (response.ok) {
      // If successful, mark as connected
      if (!connectionState.isConnected) {
        console.log('Connection restored, processing pending requests...');
        connectionState.isConnected = true;
        connectionState.lastConnectedTime = Date.now();
        processPendingRequests();
      }
    } else {
      connectionState.isConnected = false;
    }
  } catch (error) {
    connectionState.isConnected = false;
  }
};

// Process any pending transaction requests
const processPendingRequests = async () => {
  if (!connectionState.pendingRequests.length) return;
  
  console.log(`Processing ${connectionState.pendingRequests.length} pending requests`);
  
  // Process each pending request
  const pending = [...connectionState.pendingRequests];
  connectionState.pendingRequests = [];
  
  for (const pendingRequest of pending) {
    try {
      // Only process requests that are less than 24 hours old
      const requestAge = Date.now() - pendingRequest.timestamp;
      if (requestAge < 24 * 60 * 60 * 1000) {
        console.log(`Retrying request to ${pendingRequest.config.url}`);
        await api(pendingRequest.config);
      }
    } catch (error) {
      console.error('Error processing pending request:', error);
    }
  }
};

// Set up periodic connectivity check (every 30 seconds)
setInterval(checkConnectivity, 30000);

// Save pending requests to localStorage before page unload
window.addEventListener('beforeunload', () => {
  if (connectionState.pendingRequests.length > 0) {
    try {
      localStorage.setItem('pendingRequests', JSON.stringify(connectionState.pendingRequests));
    } catch (error) {
      console.error('Error saving pending requests to localStorage:', error);
    }
  }
});

// Load pending requests from localStorage on page load
try {
  const savedRequests = localStorage.getItem('pendingRequests');
  if (savedRequests) {
    const parsedRequests = JSON.parse(savedRequests);
    if (Array.isArray(parsedRequests)) {
      connectionState.pendingRequests = parsedRequests;
      // Clear the saved requests
      localStorage.removeItem('pendingRequests');
      // If we have connection, process them
      if (connectionState.isConnected) {
        processPendingRequests();
      }
    }
  }
} catch (error) {
  console.error('Error loading pending requests from localStorage:', error);
}

export default api;
