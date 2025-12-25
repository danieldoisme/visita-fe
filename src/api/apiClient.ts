import { client } from './generated/client.gen';
import { tokenStorage } from '../utils/tokenStorage';
import { refresh } from './generated/sdk.gen';

// Configure base URL from environment variable or default
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Configure the generated client with base URL and interceptors
client.instance.defaults.baseURL = baseURL;

// Request interceptor: attach JWT token to all requests
client.instance.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors and token refresh
client.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await refresh({
            body: { token: refreshToken }
          });
          
          const newToken = response.data?.result?.token;
          const newRefreshToken = response.data?.result?.refreshToken;
          
          if (newToken) {
            tokenStorage.setAccessToken(newToken);
            if (newRefreshToken) {
              tokenStorage.setRefreshToken(newRefreshToken);
            }
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return client.instance(originalRequest);
          }
        } catch {
          // Refresh failed, clear tokens and redirect to login
          tokenStorage.clearTokens();
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export { client };
export { baseURL };
