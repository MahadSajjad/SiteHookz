import axios from "axios";

declare const process: any;

const getBaseUrl = () => {
  if (typeof window !== "undefined" && (window as any).__ENV__?.API_URL)
    return (window as any).__ENV__.API_URL;
  if (
    typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL
  )
    return (import.meta as any).env.VITE_API_URL;
  if (typeof process !== "undefined" && process.env && process.env.API_URL)
    return process.env.API_URL;
  return "http://localhost:3000/api/v1";
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tenant = localStorage.getItem("sitehookz_tenant");
    if (tenant) {
      config.headers["x-sitehookz-organization"] = tenant;
    }
  }
  return config;
});
