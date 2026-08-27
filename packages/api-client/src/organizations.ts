import { apiClient } from './client';
import type { CreateOrganizationDto } from '@sitehookz/platform-contracts';

export const organizationsApi = {
  create: (data: CreateOrganizationDto) => apiClient.post('/organizations', data),
  get: (id: string) => apiClient.get(`/organizations/${id}`),
};
