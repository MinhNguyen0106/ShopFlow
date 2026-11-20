import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';
import { useInboxStore } from '@/lib/inbox.store';

vi.mock('next/navigation', () => ({
  usePathname: () => '/pages',
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    useInboxStore.setState({
      conversations: [],
    });
  });

  it('renders branding and primary navigation links', () => {
    render(<Sidebar unreadInboxCount={18} />);

    expect(screen.getByText('ShopFlow')).toBeInTheDocument();
    expect(screen.getByText('VN')).toBeInTheDocument();
    expect(screen.getByText('Soạn bài viết mới')).toBeInTheDocument();
    expect(screen.getByText('Báo cáo phân tích')).toBeInTheDocument();
    expect(screen.getByText('Hộp thư Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Lịch đăng bài')).toBeInTheDocument();
    expect(screen.getByText('Kịch bản tự động hóa')).toBeInTheDocument();
    expect(screen.getByText('Kết nối Fanpage')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt hệ thống')).toBeInTheDocument();
  });

  it('renders unread inbox badge from props', () => {
    render(<Sidebar unreadInboxCount={18} />);

    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('renders dynamic unread badge from useInboxStore when no prop provided', () => {
    useInboxStore.setState({
      conversations: [
        { id: 'c1', unread_count: 3 } as any,
        { id: 'c2', unread_count: 2 } as any,
      ],
    });

    render(<Sidebar />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render badge when total unread count is 0', () => {
    useInboxStore.setState({
      conversations: [
        { id: 'c1', unread_count: 0 } as any,
      ],
    });

    render(<Sidebar />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText('18')).not.toBeInTheDocument();
  });
});
