import { create } from 'zustand';

interface AdminUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  logout: () => void;
}

export const useAdminAuth = create<AuthState>((set) => ({
  token: localStorage.getItem('adminToken'),
  admin: localStorage.getItem('adminData') ? JSON.parse(localStorage.getItem('adminData') as string) : null,
  setAuth: (token, admin) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(admin));
    set({ token, admin });
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    set({ token: null, admin: null });
  },
}));
