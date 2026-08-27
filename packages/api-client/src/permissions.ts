import { apiClient } from './client';

export const permissionsApi = {
  list: () => apiClient.get('/permissions'),
};
