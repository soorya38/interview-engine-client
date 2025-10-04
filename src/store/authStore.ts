import { create } from 'zustand';

interface AuthState {
  user: {
    sub: string;
    email: string;
    name?: string;
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, sub: string, email: string, name?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  login: (token, sub, email, name) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_sub', sub);
    localStorage.setItem('user_email', email);
    set({
      user: { sub, email, name },
      accessToken: token,
      isAuthenticated: true,
    });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_sub');
    localStorage.removeItem('user_email');
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
