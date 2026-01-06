import axios from 'axios';
import { getTokenFromLocalStorage, removeTokenFromLocalStorage } from './localtoken';

const axiosInstance = axios.create({
  baseURL: "https://d8f661c2-51ad-4607-97c0-4d89ac3a1f1c.us-east-1.cloud.genez.io/api/v1"
  // baseURL: "http://localhost:3000/api/v1"
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenFromLocalStorage();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        removeTokenFromLocalStorage();
        
      }
    }  
    return Promise.reject(error);
  }
);

export default axiosInstance;