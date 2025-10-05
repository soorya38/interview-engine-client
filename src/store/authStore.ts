import { create } from 'zustand';

interface AuthState {
  user: {
    sub: string;
    email: string;
    name?: string;
    role?: string;
    roles?: string[];
  } | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, sub: string, email: string, name?: string, role?: string, roles?: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    const storedSub = localStorage.getItem('user_sub');
    const storedEmail = localStorage.getItem('user_email');
    const storedName = localStorage.getItem('user_name');
    const storedRole = localStorage.getItem('user_role');
    const storedRoles = localStorage.getItem('user_roles');
    if (storedSub && storedEmail) {
      return { 
        sub: storedSub, 
        email: storedEmail, 
        name: storedName || undefined,
        role: storedRole || undefined,
        roles: storedRoles ? JSON.parse(storedRoles) : undefined
      };
    }
    return null;
  })(),
  accessToken: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  login: (token, sub, email, name, role, roles) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_sub', sub);
    localStorage.setItem('user_email', email);
    if (name) {
      localStorage.setItem('user_name', name);
    }
    if (role) {
      localStorage.setItem('user_role', role);
    }
    if (roles) {
      localStorage.setItem('user_roles', JSON.stringify(roles));
    }
    set({
      user: { sub, email, name, role, roles },
      accessToken: token,
      isAuthenticated: true,
    });
  },
  logout: () => {
    console.log('Clearing local auth state...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_sub');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_roles');
    
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
