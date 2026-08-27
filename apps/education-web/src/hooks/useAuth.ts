import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.store';

// Mock implementations
export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const loginMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock login
      return { id: '1', email: data.email, name: 'Test User' };
    },
    onSuccess: (data) => {
      setAuth(data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Mock logout
    },
    onSuccess: () => {
      clearAuth();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // Mock register
      return { id: '1', email: data.email, name: 'Test User' };
    },
    onSuccess: (data) => {
      setAuth(data);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
