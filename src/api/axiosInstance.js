import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5280/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the JWT token from localStorage
    const authToken = localStorage.getItem('authToken');
    
    // If token exists, add it to the Authorization header
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - token might be expired or invalid
      localStorage.removeItem('authToken');
      // You might want to redirect to login page here
      console.warn('Authentication token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
