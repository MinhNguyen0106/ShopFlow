import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePageStore } from '../page.store';
import { apiClient } from '../api-client';

vi.mock('../api-client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Page Store (usePageStore)', () => {
  const mockPages = [
    {
      id: 'page_1',
      userId: 'usr_1',
      pageId: '1001',
      pageName: 'Tiệm Mỹ Phẩm Sài Gòn',
      category: 'Mỹ phẩm',
      tasks: ['MESSAGING'],
      isActive: true,
      webhookSubscribed: true,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
    {
      id: 'page_2',
      userId: 'usr_1',
      pageId: '1002',
      pageName: 'Hùng Sport',
      category: 'Thể thao',
      tasks: ['MESSAGING'],
      isActive: false,
      webhookSubscribed: true,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    usePageStore.setState({
      pages: [],
      selectedPage: null,
      isLoading: false,
      error: null,
    });
  });

  it('should fetch and update connected pages', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: { success: true, data: mockPages },
    });

    await usePageStore.getState().fetchPages();

    const state = usePageStore.getState();
    expect(state.pages).toHaveLength(2);
    expect(state.pages[0].pageName).toBe('Tiệm Mỹ Phẩm Sài Gòn');
    expect(state.isLoading).toBe(false);
  });

  it('should toggle page active state', async () => {
    usePageStore.setState({ pages: mockPages });

    const updated = { ...mockPages[1], isActive: true };
    (apiClient.patch as any).mockResolvedValueOnce({
      data: { success: true, data: updated },
    });

    const success = await usePageStore
      .getState()
      .togglePageActive('page_2', true);

    expect(success).toBe(true);
    const page2 = usePageStore.getState().pages.find((p) => p.id === 'page_2');
    expect(page2?.isActive).toBe(true);
  });

  it('should disconnect page and remove from list', async () => {
    usePageStore.setState({ pages: mockPages, selectedPage: mockPages[0] });

    (apiClient.delete as any).mockResolvedValueOnce({
      data: { success: true },
    });

    const success = await usePageStore.getState().disconnectPage('page_1');

    expect(success).toBe(true);
    const state = usePageStore.getState();
    expect(state.pages).toHaveLength(1);
    expect(state.selectedPage).toBeNull();
  });
});
