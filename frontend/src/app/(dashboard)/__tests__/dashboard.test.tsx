import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DashboardOverviewPage from '../page';
import { usePageStore } from '@/lib/page.store';
import { useAuthStore } from '@/lib/auth.store';
import { maskPhoneNumber } from '@/types/dashboard';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe('DashboardOverviewPage Integration Tests', () => {
  const mockPages = [
    {
      id: 'page_1',
      userId: 'usr_1',
      pageId: '10928374',
      pageName: 'Shop Thời Trang Nữ Cao Cấp',
      category: 'Thời trang',
      isActive: true,
      webhookSubscribed: true,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      id: 'page_2',
      userId: 'usr_1',
      pageId: '10928375',
      pageName: 'Tiệm Mỹ Phẩm Sài Gòn',
      category: 'Mỹ phẩm',
      isActive: true,
      webhookSubscribed: true,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 'usr_1',
        email: 'minh.shopflow@gmail.com',
        fullName: 'Minh ShopFlow',
        role: 'owner',
      },
      isAuthenticated: true,
      isCheckingAuth: false,
    });

    usePageStore.setState({
      pages: mockPages,
      selectedPage: null,
      isLoading: false,
      error: null,
      fetchPages: vi.fn().mockResolvedValue(undefined),
      selectPage: vi.fn((page) => {
        usePageStore.setState({ selectedPage: page });
      }),
    });
  });

  it('renders greeting, user name, and system online badge', () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText(/Minh ShopFlow/i)).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống trực tuyến/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Tổng quan hiệu suất tương tác/i)
    ).toBeInTheDocument();
  });

  it('renders 4 Bento KPI metrics cards', () => {
    render(<DashboardOverviewPage />);

    // 4 KPI Titles
    expect(screen.getByText('Tổng hội thoại hôm nay')).toBeInTheDocument();
    expect(screen.getByText('Tự động ẩn SĐT')).toBeInTheDocument();
    expect(screen.getByText('Lịch đăng hôm nay')).toBeInTheDocument();
    expect(screen.getByText('Tuân thủ Cửa sổ Meta 24h')).toBeInTheDocument();

    // Metric values
    expect(screen.getByText('1,248')).toBeInTheDocument();
    expect(screen.getByText('342')).toBeInTheDocument();
    expect(screen.getByText('8 / 10')).toBeInTheDocument();
    expect(screen.getByText('99.4%')).toBeInTheDocument();
  });

  it('renders Pure SVG/Tailwind Traffic Chart with golden peak indicators', () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText('Lưu Lượng Tương Tác Thời Gian Thực')).toBeInTheDocument();
    expect(screen.getByText(/Khung Giờ Vàng \(11:30 & 20:00\)/i)).toBeInTheDocument();
    expect(screen.getByText('8h')).toBeInTheDocument();
    expect(screen.getByText('22h')).toBeInTheDocument();
  });

  it('renders 4 Quick Actions with correct destinations', () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText('Lối Tắt Thao Tác Nhanh')).toBeInTheDocument();
    expect(screen.getByText('Soạn Bài Viết Mới')).toBeInTheDocument();
    expect(screen.getByText('Hộp Thư Live Chat')).toBeInTheDocument();
    expect(screen.getByText('Quản Lý Fanpage')).toBeInTheDocument();
    expect(screen.getByText('Kịch Bản Tự Động & Ẩn SĐT')).toBeInTheDocument();

    // Verify href attributes
    const postLink = screen.getByRole('link', { name: /Soạn Bài Viết Mới/i });
    expect(postLink).toHaveAttribute('href', '/posts/new');

    const inboxLink = screen.getByRole('link', { name: /Hộp Thư Live Chat/i });
    expect(inboxLink).toHaveAttribute('href', '/inbox');

    const pagesLink = screen.getByRole('link', { name: /Quản Lý Fanpage/i });
    expect(pagesLink).toHaveAttribute('href', '/pages');

    const autoLink = screen.getByRole('link', { name: /Kịch Bản Tự Động & Ẩn SĐT/i });
    expect(autoLink).toHaveAttribute('href', '/automation');
  });

  it('renders Meta 24h window countdown leads with urgent tags', () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText('Cảnh Báo Cửa Sổ 24h Meta')).toBeInTheDocument();
    expect(screen.getByText('Hoàng Yến Chi')).toBeInTheDocument();
    expect(screen.getByText(/Còn 32 phút/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Gấp/i)).toBeInTheDocument();

    // Check CTA button exists
    const chatButtons = screen.getAllByRole('link', { name: /Chat ngay/i });
    expect(chatButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Hot Leads with PII Phone Masking applied', () => {
    render(<DashboardOverviewPage />);

    expect(screen.getByText('Hot Leads Cần Chốt Đơn Gấp')).toBeInTheDocument();
    expect(screen.getByText('Lê Thu Hương')).toBeInTheDocument();

    // Masked phone format (098****321)
    expect(screen.getByText('098****321')).toBeInTheDocument();
    // Ensure raw phone is NOT in document
    expect(screen.queryByText('0988654321')).not.toBeInTheDocument();

    expect(screen.getByText('Phạm Quốc Bảo')).toBeInTheDocument();
    expect(screen.getByText('091****654')).toBeInTheDocument();
  });

  it('allows switching selected fanpage via dropdown', () => {
    render(<DashboardOverviewPage />);

    const select = screen.getByLabelText('Chọn Fanpage');
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'page_1' } });
    expect(usePageStore.getState().selectedPage?.id).toBe('page_1');

    fireEvent.change(select, { target: { value: 'all' } });
    expect(usePageStore.getState().selectedPage).toBeNull();
  });

  it('triggers refresh when clicking refresh button', async () => {
    const fetchPagesMock = vi.fn().mockResolvedValue(undefined);
    usePageStore.setState({ fetchPages: fetchPagesMock });

    render(<DashboardOverviewPage />);

    const refreshButton = screen.getByTitle('Làm mới dữ liệu');
    await act(async () => {
      fireEvent.click(refreshButton);
    });

    expect(fetchPagesMock).toHaveBeenCalled();
  });

  it('verifies maskPhoneNumber helper correctly masks sensitive Vietnamese phone numbers', () => {
    expect(maskPhoneNumber('0988654321')).toBe('098****321');
    expect(maskPhoneNumber('+84988654321')).toBe('+84****321');
    expect(maskPhoneNumber('0912345678')).toBe('091****678');
    expect(maskPhoneNumber('123')).toBe('123'); // Too short to mask
    expect(maskPhoneNumber('')).toBe('');
  });
});
