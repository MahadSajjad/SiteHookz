import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setStatus: (status: AuthState['status']) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  status: 'idle',
  setAuth: (user) => set({ isAuthenticated: true, user, status: 'authenticated' }),
  clearAuth: () => set({ isAuthenticated: false, user: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));
