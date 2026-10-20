import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api-client';

describe('API Client Wrapper', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should have correct baseURL and headers', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('should attach Bearer token to request when present in localStorage', async () => {
    localStorage.setItem('shopflow_access_token', 'mock_jwt_token_123');

    // Test request interceptor
    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
    const config = await requestInterceptor.fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBe('Bearer mock_jwt_token_123');
  });

  it('should not attach Authorization header when token is absent', async () => {
    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
    const config = await requestInterceptor.fulfilled({
      headers: {},
    });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
