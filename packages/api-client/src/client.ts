import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true,
});

let accessToken = '';

export const setAccessToken = (token: string) => {
  accessToken = token;
};

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Basic 401 refresh logic would go here
    return Promise.reject(error.response?.data || error);
  }
);
