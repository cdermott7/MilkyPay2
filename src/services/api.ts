import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error) => {
    // Implement retry logic, token refresh, etc.
    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Wallet operations
  createWallet: () => api.post('/wallet/new'),
  getWalletBalance: (publicKey: string) => api.get(`/wallet/balance/${publicKey}`),
  
  // Transaction operations
  sendPayment: (data: { sourceKeypair: string, destination: string, amount: string, asset?: string }) => 
    api.post('/tx/send', data),
  claimPayment: (data: { linkId: string, pin: string }) => 
    api.post('/tx/claim', data),
  requestRefund: (txId: string) => 
    api.post(`/tx/refund/${txId}`),
    
  // Off-ramp operations
  getOffRampOptions: (asset: string, country: string) => 
    api.get(`/anchor/options?asset=${asset}&country=${country}`),
  initiateOffRamp: (data: { asset: string, amount: string, method: string, accountDetails: any }) => 
    api.post('/anchor/offramp', data),
};

export default api;
