
import { apiClient } from './client';

export const studentsApi = {
  list: (params?: any) => apiClient.get('/education/students', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(`/education/students/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/students', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(`/education/students/${id}`, data).then(res => res.data),
  archive: (id: string) => apiClient.post(`/education/students/${id}/archive`).then(res => res.data),
  restore: (id: string) => apiClient.post(`/education/students/${id}/restore`).then(res => res.data),
};
