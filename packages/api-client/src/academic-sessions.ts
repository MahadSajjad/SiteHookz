import { apiClient } from "./client";

export const academicSessionsApi = {
  list: (orgId?: string) =>
    orgId
      ? apiClient.get(`/organizations/${orgId}/academic-sessions`).then((res) => res.data)
      : apiClient.get("/education/academic-sessions").then((res) => res.data),
};
