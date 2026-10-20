import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../login/page';
import { useAuthStore } from '@/lib/auth.store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('renders login form with email, password inputs and submit button', () => {
    render(<LoginPage />);

    expect(screen.getByText('Đăng nhập vào ShopFlow')).toBeInTheDocument();
    expect(screen.getByLabelText('Email đăng nhập')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Đăng Nhập Vào Hệ Thống/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<LoginPage />);

    fireEvent.click(
      screen.getByRole('button', { name: /Đăng Nhập Vào Hệ Thống/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Email không được để trống')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Mật khẩu phải có tối thiểu 6 ký tự')
      ).toBeInTheDocument();
    });
  });

  it('displays auth error message from store if present', () => {
    useAuthStore.setState({ error: 'Tài khoản hoặc mật khẩu không tồn tại' });
    render(<LoginPage />);

    expect(
      screen.getByText('Tài khoản hoặc mật khẩu không tồn tại')
    ).toBeInTheDocument();
  });
});
