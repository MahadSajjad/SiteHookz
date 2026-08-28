import axios from "axios";

// @ts-ignore
const baseURL =
  typeof process !== "undefined" && process.env && process.env.API_URL
    ? process.env.API_URL
    : "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

let accessToken = "";

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
    return Promise.reject(error.response?.data || error);
  },
);
