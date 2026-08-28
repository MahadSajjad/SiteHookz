import { apiClient } from "./client";
import type { LoginRequestDto } from "@sitehookz/platform-contracts";

export const authApi = {
  login: (data: LoginRequestDto) => apiClient.post("/auth/login", data),
  register: (data: any) => apiClient.post("/auth/register", data),
  refresh: () => apiClient.post("/auth/refresh"),
  logout: () => apiClient.post("/auth/logout"),
  logoutAll: () => apiClient.post("/auth/logout-all"),
  me: () => apiClient.get("/auth/me"),
  verifyEmail: (data: any) => apiClient.post("/auth/verify-email", data),
  forgotPassword: (data: any) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (data: any) => apiClient.post("/auth/reset-password", data),
};
