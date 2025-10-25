import config from './config';

export const apiClient = {
  baseUrl: config.apiBaseUrl,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Build headers; if uploading FormData, don't set Content-Type (browser sets correct boundary)
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };
    const defaultOptions: RequestInit = { headers };
    
    return fetch(url, { ...defaultOptions, ...options });
  },
  
  // Convenience methods
  get: (endpoint: string, options?: RequestInit) => 
    apiClient.request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'POST',
      body: (typeof FormData !== 'undefined' && data instanceof FormData)
        ? data
        : (data ? JSON.stringify(data) : undefined),
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'PUT',
      body: (typeof FormData !== 'undefined' && data instanceof FormData)
        ? data
        : (data ? JSON.stringify(data) : undefined),
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
