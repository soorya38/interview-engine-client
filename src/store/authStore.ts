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
    console.log('Clearing local auth state...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_sub');
    localStorage.removeItem('user_email');
    
    // Clear OIDC-related localStorage items
    const oidcKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('oidc.') || 
      key.startsWith('oidc_client') ||
      key.includes('oidc') ||
      key.includes('user') ||
      key.includes('token')
    );
    oidcKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed OIDC key: ${key}`);
    });
    
    // Also clear sessionStorage
    const sessionKeys = Object.keys(sessionStorage).filter(key => 
      key.includes('oidc') ||
      key.includes('user') ||
      key.includes('token')
    );
    sessionKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`Removed session key: ${key}`);
    });
    
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    console.log('Local auth state cleared');
  },
}));
