import { apiClient } from "./client";

export const membershipsApi = {
  list: (orgId: string) => apiClient.get(`/organizations/${orgId}/memberships`),
};
