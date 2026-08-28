import { apiClient } from "./client";

export const staffApi = {
  list: (params?: any) =>
    apiClient.get("/education/staff", { params }).then((res) => res.data),
  get: (id: string) =>
    apiClient.get(`/education/staff/${id}`).then((res) => res.data),
  create: (data: any) =>
    apiClient.post("/education/staff", data).then((res) => res.data),
  listPositions: () =>
    apiClient.get("/education/staff-positions").then((res) => res.data),
  createPosition: (data: any) =>
    apiClient.post("/education/staff-positions", data).then((res) => res.data),
  listAssignments: (staffId: string) =>
    apiClient
      .get(`/education/staff/${staffId}/assignments`)
      .then((res) => res.data),
  createAssignment: (staffId: string, data: any) =>
    apiClient
      .post(`/education/staff/${staffId}/assignments`, data)
      .then((res) => res.data),
  endAssignment: (staffId: string, assignmentId: string) =>
    apiClient
      .post(`/education/staff/${staffId}/assignments/${assignmentId}/end`)
      .then((res) => res.data),
};
