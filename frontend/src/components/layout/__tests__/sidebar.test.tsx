import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/pages',
}));

describe('Sidebar Component', () => {
  it('renders branding and primary navigation links', () => {
    render(<Sidebar unreadInboxCount={18} />);

    expect(screen.getByText('ShopFlow')).toBeInTheDocument();
    expect(screen.getByText('VN')).toBeInTheDocument();
    expect(screen.getByText('Soạn bài viết mới')).toBeInTheDocument();
    expect(screen.getByText('Tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Hộp thư Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Lịch đăng bài')).toBeInTheDocument();
    expect(screen.getByText('Kịch bản tự động hóa')).toBeInTheDocument();
    expect(screen.getByText('Kết nối Fanpage')).toBeInTheDocument();
  });

  it('renders unread inbox badge and Meta API rate limit gauge', () => {
    render(<Sidebar unreadInboxCount={18} />);

    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Meta Graph API v19')).toBeInTheDocument();
    expect(screen.getByText('24%')).toBeInTheDocument();
    expect(screen.getByText('Meta Partner Verified')).toBeInTheDocument();
  });
});
