import { SiteHookzClient } from '@sitehookz/api-client';

// Simple mock for now if not integrated fully with auth provider
const client = new SiteHookzClient({
  baseURL: 'http://localhost:3000/api/v1',
  getAccessToken: () => localStorage.getItem('token') || '',
});

export function useApiClient() {
  return client;
}
