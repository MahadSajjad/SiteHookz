
import { apiClient } from './client';

export const sectionsApi = {
  list: (params?: any) => apiClient.get('/education/sections', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(`/education/sections/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/sections', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(`/education/sections/${id}`, data).then(res => res.data),
};
