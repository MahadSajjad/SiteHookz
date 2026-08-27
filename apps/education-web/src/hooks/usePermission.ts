import { useAuthStore } from '../stores/auth.store';

export const usePermission = (permission?: string, branchId?: string) => {
  const { user } = useAuthStore();
  return true;
}
