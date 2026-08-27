import { useAuthStore } from '../stores/auth.store';

export const usePermission = (_permission?: string, _branchId?: string) => {
  const { user: _user } = useAuthStore();
  return true;
}
