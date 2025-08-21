import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      login: async (email: string, password: string, tenantId?: string) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, tenantId }),
        });

        if (!response.ok) {
          throw new Error('Login failed');
        }

        const data = await response.json();
        set({ user: data.user, token: data.token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setUser: (user: User, token: string) => {
        set({ user, token });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);