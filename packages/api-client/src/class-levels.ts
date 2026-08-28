
import { apiClient } from './client';

export const classLevelsApi = {
  list: (params?: any) => apiClient.get('/education/class-levels', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(`/education/class-levels/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/class-levels', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(`/education/class-levels/${id}`, data).then(res => res.data),
  archive: (id: string) => apiClient.post(`/education/class-levels/${id}/archive`).then(res => res.data),
  restore: (id: string) => apiClient.post(`/education/class-levels/${id}/restore`).then(res => res.data),
};
