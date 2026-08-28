import { apiClient } from "./client";

export const batchesApi = {
  list: (params?: any) =>
    apiClient.get("/education/batches", { params }).then((res) => res.data),
  get: (id: string) =>
    apiClient.get(`/education/batches/${id}`).then((res) => res.data),
  create: (data: any) =>
    apiClient.post("/education/batches", data).then((res) => res.data),
  update: (id: string, data: any) =>
    apiClient.patch(`/education/batches/${id}`, data).then((res) => res.data),
};
