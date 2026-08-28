
import { apiClient } from './client';

export const coursesApi = {
  list: (params?: any) => apiClient.get('/education/courses', { params }).then(res => res.data),
  get: (id: string) => apiClient.get(`/education/courses/${id}`).then(res => res.data),
  create: (data: any) => apiClient.post('/education/courses', data).then(res => res.data),
  update: (id: string, data: any) => apiClient.patch(`/education/courses/${id}`, data).then(res => res.data),
};
