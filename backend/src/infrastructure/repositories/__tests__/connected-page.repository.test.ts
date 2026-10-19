/**
 * ShopFlow - Unit Tests: connected-page.repository.ts
 * File: backend/src/infrastructure/repositories/__tests__/connected-page.repository.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectedPageRepository, ConnectedPage } from '../connected-page.repository.js';
import * as dbClient from '../../database/db.client.js';

vi.mock('../../database/db.client.js', () => ({
  query: vi.fn(),
}));

describe('ConnectedPageRepository', () => {
  let repo: ConnectedPageRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new ConnectedPageRepository();
  });

  describe('findByPageId()', () => {
    it('nên tìm thấy thông tin Fanpage đã kết nối theo Meta page_id', async () => {
      const mockPage: ConnectedPage = {
        id: 'uuid-page-1',
        user_id: 'uuid-user-1',
        page_id: 'meta_page_100',
        page_name: 'Shop Áo Quần',
        page_access_token: 'EAAB_token_abc',
        is_active: true,
        webhook_subscribed: true,
      };

      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [mockPage],
        rowCount: 1,
        command: 'SELECT',
      });

      const result = await repo.findByPageId('meta_page_100');
      expect(result).toEqual(mockPage);
    });

    it('nên trả về null nếu không tìm thấy page_id hoặc trang không active', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      });

      const result = await repo.findByPageId('meta_page_unknown');
      expect(result).toBeNull();
    });
  });

  describe('getAccessToken()', () => {
    it('nên trả về page_access_token khi trang tồn tại', async () => {
      const mockPage: ConnectedPage = {
        id: 'uuid-page-1',
        user_id: 'uuid-user-1',
        page_id: 'meta_page_100',
        page_name: 'Shop Áo Quần',
        page_access_token: 'EAAB_token_xyz',
        is_active: true,
        webhook_subscribed: true,
      };

      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [mockPage],
        rowCount: 1,
        command: 'SELECT',
      });

      const token = await repo.getAccessToken('meta_page_100');
      expect(token).toBe('EAAB_token_xyz');
    });

    it('nên trả về null nếu không tìm thấy trang', async () => {
      vi.mocked(dbClient.query).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      });

      const token = await repo.getAccessToken('meta_page_unknown');
      expect(token).toBeNull();
    });
  });
});
