import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPage from '../page';
import { useSettingsStore } from '@/lib/settings.store';

// Mock components con để tập trung test page điều hướng tabs
vi.mock('@/components/settings/profile-settings-tab', () => ({
  ProfileSettingsTab: () => <div data-testid="profile-settings-tab">Mock Profile Tab</div>,
}));

vi.mock('@/components/settings/security-password-tab', () => ({
  SecurityPasswordTab: () => <div data-testid="security-password-tab">Mock Security Tab</div>,
}));

vi.mock('@/components/settings/api-limits-monitor-tab', () => ({
  ApiLimitsMonitorTab: () => <div data-testid="api-limits-monitor-tab">Mock Meta Limits Tab</div>,
}));

describe('SettingsPage Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('render tiêu đề và 3 tabs phân hệ cài đặt', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Cài đặt Hệ thống & Hồ sơ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hồ sơ & Tài khoản/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bảo mật & Mật khẩu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Giám sát Meta Graph API/i })).toBeInTheDocument();

    // Mặc định tab profile hiển thị
    expect(screen.getByTestId('profile-settings-tab')).toBeInTheDocument();
  });

  it('chuyển đổi sang tab Bảo mật & Mật khẩu khi nhấn nút', () => {
    render(<SettingsPage />);

    const securityTabBtn = screen.getByRole('button', { name: /Bảo mật & Mật khẩu/i });
    fireEvent.click(securityTabBtn);

    expect(screen.getByTestId('security-password-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-settings-tab')).not.toBeInTheDocument();
  });

  it('chuyển đổi sang tab Giám sát Meta API khi nhấn nút', () => {
    render(<SettingsPage />);

    const metaLimitsTabBtn = screen.getByRole('button', { name: /Giám sát Meta Graph API/i });
    fireEvent.click(metaLimitsTabBtn);

    expect(screen.getByTestId('api-limits-monitor-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('profile-settings-tab')).not.toBeInTheDocument();
  });
});
