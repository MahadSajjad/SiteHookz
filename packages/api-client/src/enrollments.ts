
import { apiClient } from './client';

export const enrollmentsApi = {
  studentHistory: (studentId: string) => apiClient.get(`/education/students/${studentId}/enrollments`).then(res => res.data),
  createSchool: (studentId: string, data: any) => apiClient.post(`/education/students/${studentId}/enrollments/school`, data).then(res => res.data),
  createTuition: (studentId: string, data: any) => apiClient.post(`/education/students/${studentId}/enrollments/tuition`, data).then(res => res.data),
  endEnrollment: (id: string, data: any) => apiClient.post(`/education/enrollments/${id}/end`, data).then(res => res.data),
  promote: (id: string, data: any) => apiClient.post(`/education/enrollments/${id}/promote`, data).then(res => res.data),
  transfer: (id: string, data: any) => apiClient.post(`/education/enrollments/${id}/transfer`, data).then(res => res.data),
  changeSection: (id: string, data: any) => apiClient.post(`/education/enrollments/${id}/change-section`, data).then(res => res.data),
  changeBatch: (id: string, data: any) => apiClient.post(`/education/enrollments/${id}/change-batch`, data).then(res => res.data),
};
