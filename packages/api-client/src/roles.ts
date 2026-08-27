import { apiClient } from './client';

export const rolesApi = {
  list: (orgId: string) => apiClient.get(`/organizations/${orgId}/roles`),
};
