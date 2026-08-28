import { studentsApi, guardiansApi, staffApi } from '@sitehookz/api-client';

export function useApiClient() {
  return {
    students: studentsApi,
    guardians: guardiansApi,
    staff: staffApi,
  };
}
