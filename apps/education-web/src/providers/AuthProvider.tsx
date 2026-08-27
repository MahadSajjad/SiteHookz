import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setStatus, clearAuth } = useAuthStore();

  useEffect(() => {
    // Check auth status on mount
    // For now, simple mock
    const checkAuth = async () => {
      setStatus('loading');
      try {
        // mock API call
        // const user = await api.get('/auth/me');
        // setAuth(user);
        clearAuth();
      } catch (error) {
        clearAuth();
      }
    };
    checkAuth();
  }, [setStatus, clearAuth]);

  return <>{children}</>;
}
