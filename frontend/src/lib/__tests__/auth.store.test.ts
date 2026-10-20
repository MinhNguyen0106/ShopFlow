import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Store (useAuthStore)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: true,
      error: null,
    });
  });

  it('should have initial unauthenticated state with isLoading false and isCheckingAuth true', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isCheckingAuth).toBe(true);
  });

  it('should successfully login and store tokens in localStorage', async () => {
    const mockUser = {
      id: 'usr_1',
      email: 'shop@test.com',
      fullName: 'Shop Owner',
      role: 'owner' as const,
    };

    (apiClient.post as any).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: mockUser,
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      },
    });

    const success = await useAuthStore
      .getState()
      .login('shop@test.com', 'password123');

    expect(success).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('mock_access_token');
    expect(localStorage.getItem('shopflow_access_token')).toBe(
      'mock_access_token'
    );
  });

  it('should set error on login failure', async () => {
    (apiClient.post as any).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Email hoặc mật khẩu không chính xác',
        },
      },
    });

    const success = await useAuthStore
      .getState()
      .login('wrong@test.com', 'wrongpass');

    expect(success).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Email hoặc mật khẩu không chính xác');
  });

  it('should logout and clear localStorage', async () => {
    localStorage.setItem('shopflow_access_token', 'token_to_remove');
    useAuthStore.setState({
      user: { id: 'u1', email: 'e', fullName: 'f', role: 'owner' },
      isAuthenticated: true,
      accessToken: 'token_to_remove',
    });

    (apiClient.post as any).mockResolvedValueOnce({ data: { success: true } });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(localStorage.getItem('shopflow_access_token')).toBeNull();
  });
});
