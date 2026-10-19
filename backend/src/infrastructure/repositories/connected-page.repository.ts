/**
 * ShopFlow - Connected Pages Repository
 * File: backend/src/infrastructure/repositories/connected-page.repository.ts
 *
 * Tương tác với bảng `connected_pages` trong PostgreSQL để tra cứu Page Access Token.
 */

import { query } from '../database/db.client.js';

export interface ConnectedPage {
  id: string;
  user_id: string;
  page_id: string;
  page_name: string;
  page_access_token: string;
  is_active: boolean;
  webhook_subscribed: boolean;
}

export class ConnectedPageRepository {
  /**
   * Tìm Fanpage theo Meta Page ID.
   */
  async findByPageId(pageId: string): Promise<ConnectedPage | null> {
    const sql = `
      SELECT id, user_id, page_id, page_name, page_access_token, is_active, webhook_subscribed
      FROM connected_pages
      WHERE page_id = $1 AND is_active = TRUE
      LIMIT 1
    `;
    const result = await query<ConnectedPage>(sql, [pageId]);
    return result.rows[0] ?? null;
  }

  /**
   * Lấy Page Access Token của Fanpage.
   */
  async getAccessToken(pageId: string): Promise<string | null> {
    const page = await this.findByPageId(pageId);
    return page?.page_access_token ?? null;
  }
}

export const connectedPageRepository = new ConnectedPageRepository();
