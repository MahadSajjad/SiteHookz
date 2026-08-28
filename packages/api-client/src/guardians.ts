import { apiClient } from "./client";

export const guardiansApi = {
  list: (params?: any) =>
    apiClient.get("/education/guardians", { params }).then((res) => res.data),
  get: (id: string) =>
    apiClient.get(`/education/guardians/${id}`).then((res) => res.data),
  create: (data: any) =>
    apiClient.post("/education/guardians", data).then((res) => res.data),
  update: (id: string, data: any) =>
    apiClient.patch(`/education/guardians/${id}`, data).then((res) => res.data),
  getStudentGuardians: (studentId: string) =>
    apiClient
      .get(`/education/students/${studentId}/guardians`)
      .then((res) => res.data),
  linkGuardian: (studentId: string, data: any) =>
    apiClient
      .post(`/education/students/${studentId}/guardians`, data)
      .then((res) => res.data),
  unlinkGuardian: (studentId: string, relationshipId: string) =>
    apiClient
      .delete(`/education/students/${studentId}/guardians/${relationshipId}`)
      .then((res) => res.data),
};
