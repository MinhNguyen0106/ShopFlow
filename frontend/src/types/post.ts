/**
 * ShopFlow - Scheduled Post Types & DTO Interfaces
 * File: frontend/src/types/post.ts
 *
 * Đồng bộ hợp đồng DTO với backend và tuân thủ .agents/rules/api-contract-sync.md
 */

export type PostStatus =
  | 'pending'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'cancelled';

export type PostMediaType = 'none' | 'photo' | 'video';

export interface ScheduledPostItem {
  id: string;
  pageId: string;
  page_id?: string;
  userId: string;
  user_id?: string;
  contentText: string;
  content_text?: string;
  mediaType: PostMediaType;
  media_type?: PostMediaType;
  mediaUrls: string[];
  media_urls?: string[];
  scheduledTime: string;
  scheduled_time?: string;
  status: PostStatus;
  metaPostId: string | null;
  meta_post_id?: string | null;
  errorMessage: string | null;
  error_message?: string | null;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedPostsResponse {
  posts: ScheduledPostItem[];
  meta: PaginationMeta;
}

export interface QueryPostsParams {
  pageId?: string;
  page_id?: string;
  status?: PostStatus | 'all';
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PostStatusChangedPayload {
  postId: string;
  status: PostStatus;
  metaPostId?: string | null;
  errorMessage?: string | null;
  updatedAt?: string;
}

/**
 * Hàm chuẩn hóa DTO (Defensive Normalizer)
 * Đảm bảo dữ liệu từ API dù ở dạng snake_case hay camelCase đều truy cập được qua camelCase chuẩn
 */
export function normalizePostItem(raw: unknown): ScheduledPostItem {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      pageId: '',
      userId: '',
      contentText: '',
      mediaType: 'none',
      mediaUrls: [],
      scheduledTime: new Date().toISOString(),
      status: 'pending',
      metaPostId: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const r = raw as Record<string, unknown>;

  const rawMediaUrls = r.mediaUrls || r.media_urls;
  const mediaUrls: string[] = Array.isArray(rawMediaUrls)
    ? rawMediaUrls.map((url) => String(url))
    : [];

  const rawStatus = String(r.status || 'pending').toLowerCase();
  const validStatuses: PostStatus[] = ['pending', 'scheduled', 'published', 'failed', 'cancelled'];
  const status: PostStatus = validStatuses.includes(rawStatus as PostStatus)
    ? (rawStatus as PostStatus)
    : 'pending';

  const rawMediaType = String(r.mediaType || r.media_type || 'none').toLowerCase();
  const validMediaTypes: PostMediaType[] = ['none', 'photo', 'video'];
  const mediaType: PostMediaType = validMediaTypes.includes(rawMediaType as PostMediaType)
    ? (rawMediaType as PostMediaType)
    : 'none';

  return {
    id: String(r.id || ''),
    pageId: String(r.pageId || r.page_id || ''),
    page_id: String(r.page_id || r.pageId || ''),
    userId: String(r.userId || r.user_id || ''),
    user_id: String(r.user_id || r.userId || ''),
    contentText: String(r.contentText || r.content_text || ''),
    content_text: String(r.content_text || r.contentText || ''),
    mediaType,
    media_type: mediaType,
    mediaUrls,
    media_urls: mediaUrls,
    scheduledTime: String(r.scheduledTime || r.scheduled_time || new Date().toISOString()),
    scheduled_time: String(r.scheduled_time || r.scheduledTime || new Date().toISOString()),
    status,
    metaPostId: r.metaPostId ? String(r.metaPostId) : r.meta_post_id ? String(r.meta_post_id) : null,
    meta_post_id: r.meta_post_id ? String(r.meta_post_id) : r.metaPostId ? String(r.metaPostId) : null,
    errorMessage: r.errorMessage ? String(r.errorMessage) : r.error_message ? String(r.error_message) : null,
    error_message: r.error_message ? String(r.error_message) : r.errorMessage ? String(r.errorMessage) : null,
    createdAt: String(r.createdAt || r.created_at || new Date().toISOString()),
    created_at: String(r.created_at || r.createdAt || new Date().toISOString()),
    updatedAt: String(r.updatedAt || r.updated_at || new Date().toISOString()),
    updated_at: String(r.updated_at || r.updatedAt || new Date().toISOString()),
  };
}
