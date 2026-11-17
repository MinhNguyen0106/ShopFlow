/**
 * ShopFlow - Scheduled Post DTOs & Validation Schemas
 * File: backend/src/api/dtos/post.dto.ts
 *
 * Định nghĩa các schemas Zod kiểm thực dữ liệu đầu vào cho tính năng tạo, sửa, đặt lịch xuất bản bài viết.
 * Tương thích đồng thời cả chuẩn camelCase và snake_case theo quy tắc api-contract-sync.
 */

import { z } from 'zod';

export const PostMediaTypeEnum = z.enum(['none', 'photo', 'video']);
export type PostMediaType = z.infer<typeof PostMediaTypeEnum>;

export const PostStatusEnum = z.enum([
  'pending',
  'scheduled',
  'published',
  'failed',
  'cancelled',
]);
export type PostStatus = z.infer<typeof PostStatusEnum>;

const BaseCreatePostSchema = z
  .object({
    page_id: z.string().min(1, { message: 'page_id không được để trống' }),
    content_text: z.string().default(''),
    media_type: PostMediaTypeEnum.default('none'),
    media_urls: z.array(z.string().url({ message: 'URL tệp media không hợp lệ' })).default([]),
    scheduled_time: z
      .string()
      .datetime({ message: 'scheduled_time phải là định dạng ISO 8601 hợp lệ' })
      .refine(
        (val) => new Date(val).getTime() > Date.now() - 60000,
        { message: 'Thời gian đặt lịch phải ở trong tương lai' }
      ),
  })
  .refine(
    (data) => data.content_text.trim().length > 0 || data.media_urls.length > 0,
    {
      message: 'Bài viết phải có nội dung văn bản hoặc ít nhất một tệp media',
      path: ['content_text'],
    }
  );

export const CreatePostDtoSchema = z.preprocess((input) => {
  if (input && typeof input === 'object') {
    const raw = input as Record<string, unknown>;
    return {
      ...raw,
      page_id: raw.page_id ?? raw.pageId,
      content_text: raw.content_text ?? raw.contentText ?? '',
      media_type: raw.media_type ?? raw.mediaType ?? 'none',
      media_urls: raw.media_urls ?? raw.mediaUrls ?? [],
      scheduled_time: raw.scheduled_time ?? raw.scheduledTime,
    };
  }
  return input;
}, BaseCreatePostSchema);

export type CreatePostDto = z.infer<typeof BaseCreatePostSchema>;

const BaseUpdatePostSchema = z.object({
  content_text: z.string().min(1).optional(),
  media_type: PostMediaTypeEnum.optional(),
  media_urls: z.array(z.string().url({ message: 'URL tệp media không hợp lệ' })).optional(),
  scheduled_time: z
    .string()
    .datetime({ message: 'scheduled_time phải là định dạng ISO 8601 hợp lệ' })
    .refine(
      (val) => new Date(val).getTime() > Date.now() - 60000,
      { message: 'Thời gian đặt lịch phải ở trong tương lai' }
    )
    .optional(),
});

export const UpdatePostDtoSchema = z.preprocess((input) => {
  if (input && typeof input === 'object') {
    const raw = input as Record<string, unknown>;
    return {
      ...raw,
      content_text: raw.content_text ?? raw.contentText,
      media_type: raw.media_type ?? raw.mediaType,
      media_urls: raw.media_urls ?? raw.mediaUrls,
      scheduled_time: raw.scheduled_time ?? raw.scheduledTime,
    };
  }
  return input;
}, BaseUpdatePostSchema);

export type UpdatePostDto = z.infer<typeof BaseUpdatePostSchema>;

const BaseQueryPostsSchema = z.object({
  page_id: z.string().optional(),
  status: PostStatusEnum.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const QueryPostsDtoSchema = z.preprocess((input) => {
  if (input && typeof input === 'object') {
    const raw = input as Record<string, unknown>;
    return {
      ...raw,
      page_id: raw.page_id ?? raw.pageId,
    };
  }
  return input;
}, BaseQueryPostsSchema);

export type QueryPostsDto = z.infer<typeof BaseQueryPostsSchema>;
