import { apiClient } from "./client";

export const academicSessionsApi = {
  list: (orgId: string) =>
    apiClient.get(`/organizations/${orgId}/academic-sessions`),
};
