import { apiClient } from "./client";

export const invitationsApi = {
  list: (orgId: string) => apiClient.get(`/organizations/${orgId}/invitations`),
};
