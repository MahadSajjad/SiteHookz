import { apiClient } from './client';
import type { CreateBranchDto } from '@sitehookz/platform-contracts';

export const branchesApi = {
  create: (orgId: string, data: CreateBranchDto) => apiClient.post(`/organizations/${orgId}/branches`, data),
  list: (orgId: string) => apiClient.get(`/organizations/${orgId}/branches`),
};
