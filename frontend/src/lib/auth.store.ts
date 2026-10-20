import { create } from 'zustand';
import { apiClient } from './api-client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'staff';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data?.data || {};

      if (accessToken && user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopflow_access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('shopflow_refresh_token', refreshToken);
          }
          localStorage.setItem('shopflow_user', JSON.stringify(user));
        }

        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      throw new Error('Dữ liệu đăng nhập không hợp lệ');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        fullName,
      });
      const { user, accessToken, refreshToken } = response.data?.data || {};

      if (accessToken && user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopflow_access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('shopflow_refresh_token', refreshToken);
          }
          localStorage.setItem('shopflow_user', JSON.stringify(user));
        }

        set({
          user,
          accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }
      throw new Error('Dữ liệu đăng ký không hợp lệ');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Đăng ký thất bại. Vui lòng thử lại sau.';
      set({ error: errorMsg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout').catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('shopflow_access_token');
        localStorage.removeItem('shopflow_refresh_token');
        localStorage.removeItem('shopflow_user');
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    if (typeof window === 'undefined') {
      set({ isCheckingAuth: false });
      return;
    }

    const token = localStorage.getItem('shopflow_access_token');
    const savedUser = localStorage.getItem('shopflow_user');

    if (!token) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
      return;
    }

    try {
      let user: User | null = null;
      if (savedUser) {
        try {
          user = JSON.parse(savedUser);
        } catch {
          user = null;
        }
      }

      // Verify with backend
      const response = await apiClient.get('/auth/me');
      const verifiedUser = response.data?.data?.user || user;

      set({
        user: verifiedUser,
        accessToken: token,
        refreshToken: localStorage.getItem('shopflow_refresh_token'),
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch {
      // If /auth/me fails, try using cached user if token exists, or reset
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          set({
            user,
            accessToken: token,
            refreshToken: localStorage.getItem('shopflow_refresh_token'),
            isAuthenticated: true,
            isCheckingAuth: false,
          });
          return;
        } catch {
          // parse failed
        }
      }

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },
}));
