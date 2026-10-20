import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PagesManagementPage from '../page';
import { usePageStore } from '@/lib/page.store';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('PagesManagementPage Component', () => {
  const mockPages = [
    {
      id: 'page_1',
      userId: 'usr_1',
      pageId: '10928374',
      pageName: 'Tiệm Mỹ Phẩm Sài Gòn',
      category: 'Mỹ phẩm & Làm đẹp',
      tasks: ['MESSAGING'],
      isActive: true,
      webhookSubscribed: true,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    usePageStore.setState({
      pages: mockPages,
      isLoading: false,
      error: null,
      fetchPages: vi.fn(),
      togglePageActive: vi.fn().mockResolvedValue(true),
      disconnectPage: vi.fn().mockResolvedValue(true),
      selectPage: vi.fn(),
    });
  });

  it('renders header, 4 bento metric cards and connected page card', () => {
    render(<PagesManagementPage />);

    // Header & Breadcrumb
    expect(
      screen.getByRole('heading', {
        name: 'Quản lý Fanpage & Kênh bán hàng',
      })
    ).toBeInTheDocument();

    // 4 Bento Metric Cards
    expect(screen.getByText('Tổng số trang kết nối')).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    expect(
      screen.getByText('Trạng thái Webhook & Token')
    ).toBeInTheDocument();
    expect(screen.getByText('100% Hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Lưu lượng hôm nay')).toBeInTheDocument();
    expect(screen.getByText('1,428')).toBeInTheDocument();
    expect(
      screen.getByText('Tốc độ phản hồi trung bình')
    ).toBeInTheDocument();
    expect(screen.getByText('1.4s')).toBeInTheDocument();

    // Page Card
    expect(screen.getByText('Tiệm Mỹ Phẩm Sài Gòn')).toBeInTheDocument();
    expect(screen.getByText('Mỹ phẩm & Làm đẹp')).toBeInTheDocument();
    expect(screen.getByText('10928374')).toBeInTheDocument();
    expect(screen.getByText('Đang đồng bộ Webhook')).toBeInTheDocument();
    expect(screen.getByText('Đang bật')).toBeInTheDocument();
  });

  it('triggers togglePageActive when switch button is clicked', async () => {
    render(<PagesManagementPage />);

    const switchBtn = screen.getByRole('button', {
      name: 'Bật tắt tiếp nhận',
    });
    await act(async () => {
      fireEvent.click(switchBtn);
    });

    expect(usePageStore.getState().togglePageActive).toHaveBeenCalledWith(
      'page_1',
      false
    );
  });
});
