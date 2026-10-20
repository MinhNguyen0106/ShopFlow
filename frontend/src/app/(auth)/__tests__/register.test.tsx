import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../register/page';
import { useAuthStore } from '@/lib/auth.store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('renders register form elements', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Đăng ký tài khoản mới')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên chủ shop')).toBeInTheDocument();
    expect(screen.getByLabelText('Email đăng nhập')).toBeInTheDocument();
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument();
    expect(screen.getByLabelText('Xác nhận mật khẩu')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tạo Tài Khoản Doanh Nghiệp/i })
    ).toBeInTheDocument();
  });

  it('validates required fields on empty submit', async () => {
    render(<RegisterPage />);

    fireEvent.click(
      screen.getByRole('button', { name: /Tạo Tài Khoản Doanh Nghiệp/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText('Họ tên phải có tối thiểu 2 ký tự')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Email không được để trống')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Mật khẩu phải có tối thiểu 6 ký tự')
      ).toBeInTheDocument();
    });
  });
});
