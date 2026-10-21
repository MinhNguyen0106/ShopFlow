'use client';

/**
 * ShopFlow - Posts List View Component
 * File: frontend/src/components/posts/posts-list-view.tsx
 *
 * Hiển thị danh sách bài viết dạng bảng theo phong cách macOS Clean Utility.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  RotateCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { usePostStore } from '../../lib/post.store';
import { PostStatusBadge } from './post-status-badge';
import { ScheduledPostItem } from '../../types/post';

interface PostsListViewProps {
  onNewPostClick?: () => void;
}

export const PostsListView: React.FC<PostsListViewProps> = ({ onNewPostClick }) => {
  const {
    posts,
    meta,
    isLoading,
    isActionLoading,
    changePage,
    retryPost,
    cancelPost,
  } = usePostStore();

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  // Định dạng ngày giờ thân thiện theo giờ Việt Nam
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'Chưa xác định';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const handleRetry = async (postId: string) => {
    await retryPost(postId);
  };

  const handleCancel = async (postId: string) => {
    await cancelPost(postId);
    setConfirmCancelId(null);
  };

  // Skeleton loading rows
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="w-full bg-card/40 border border-border/40 rounded-xl overflow-hidden p-6 animate-pulse space-y-4">
          <div className="h-6 bg-muted/40 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-muted/20 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div
        data-testid="posts-empty-state"
        className="w-full bg-card/40 border border-border/50 rounded-2xl p-12 text-center backdrop-blur-md flex flex-col items-center justify-center min-h-[360px]"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 ring-8 ring-primary/5">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Chưa có bài viết nào được lên lịch
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Bắt đầu lên kế hoạch và xuất bản nội dung tự động cho các kênh Fanpage của bạn ngay hôm nay.
        </p>
        {onNewPostClick ? (
          <button
            onClick={onNewPostClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo bài viết mới
          </button>
        ) : (
          <Link
            href="/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo bài viết mới
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="w-full bg-card/60 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30 text-muted-foreground font-medium text-xs">
                <th className="py-3 px-4 w-[45%]">Bài viết & Nội dung</th>
                <th className="py-3 px-4 w-[15%]">Fanpage</th>
                <th className="py-3 px-4 w-[18%]">Thời gian đăng</th>
                <th className="py-3 px-4 w-[12%]">Trạng thái</th>
                <th className="py-3 px-4 w-[10%] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {posts.map((post: ScheduledPostItem) => {
                const mediaUrls = post.mediaUrls || post.media_urls || [];
                const mediaType = post.mediaType || post.media_type || 'none';
                const content = post.contentText || post.content_text || '(Không có nội dung chữ)';
                const pageId = post.pageId || post.page_id || 'Chung';
                const scheduledTime = post.scheduledTime || post.scheduled_time;
                const errorMessage = post.errorMessage || post.error_message;

                return (
                  <tr
                    key={post.id}
                    data-testid={`post-row-${post.id}`}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Column 1: Content & Media */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-start gap-3">
                        {/* Media Preview Thumbnail */}
                        <div className="w-14 h-14 rounded-lg bg-muted/40 border border-border/40 shrink-0 overflow-hidden flex items-center justify-center relative">
                          {mediaUrls.length > 0 ? (
                            mediaType === 'video' ? (
                              <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 text-white">
                                <VideoIcon className="w-6 h-6" />
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={mediaUrls[0]}
                                alt="Media thumbnail"
                                className="w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <FileText className="w-6 h-6 text-muted-foreground/60" />
                          )}
                          {mediaUrls.length > 1 && (
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white leading-none">
                              +{mediaUrls.length - 1}
                            </span>
                          )}
                        </div>

                        {/* Text info */}
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-medium line-clamp-2 leading-relaxed">
                            {content}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            {mediaType === 'photo' && (
                              <span className="inline-flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-sky-400" />
                                {mediaUrls.length} ảnh
                              </span>
                            )}
                            {mediaType === 'video' && (
                              <span className="inline-flex items-center gap-1">
                                <VideoIcon className="w-3 h-3 text-violet-400" />
                                Video
                              </span>
                            )}
                            {mediaType === 'none' && (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="w-3 h-3 text-muted-foreground" />
                                Văn bản thuần
                              </span>
                            )}
                            {post.metaPostId && (
                              <span className="font-mono text-muted-foreground/80">
                                ID: {post.metaPostId.slice(0, 12)}...
                              </span>
                            )}
                          </div>

                          {/* Error message tooltip/note */}
                          {errorMessage && post.status === 'failed' && (
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{errorMessage}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Fanpage */}
                    <td className="py-3.5 px-4 align-top text-muted-foreground font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/40 border border-border/40 text-xs text-foreground">
                        {pageId}
                      </span>
                    </td>

                    {/* Column 3: Scheduled Time */}
                    <td className="py-3.5 px-4 align-top text-muted-foreground">
                      <div className="text-xs font-medium text-foreground">
                        {formatDateTime(scheduledTime)}
                      </div>
                    </td>

                    {/* Column 4: Status */}
                    <td className="py-3.5 px-4 align-top">
                      <PostStatusBadge status={post.status} />
                    </td>

                    {/* Column 5: Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Retry action for failed posts */}
                        {post.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(post.id)}
                            disabled={isActionLoading}
                            data-testid={`retry-btn-${post.id}`}
                            title="Thử lại xuất bản bài viết"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all disabled:opacity-50"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Thử lại</span>
                          </button>
                        )}

                        {/* Cancel action for pending or scheduled posts */}
                        {(post.status === 'pending' || post.status === 'scheduled') && (
                          confirmCancelId === post.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleCancel(post.id)}
                                disabled={isActionLoading}
                                data-testid={`confirm-cancel-btn-${post.id}`}
                                className="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition-all shadow-sm"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => setConfirmCancelId(null)}
                                className="px-2 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted/40 transition-all"
                              >
                                Đóng
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmCancelId(post.id)}
                              disabled={isActionLoading}
                              data-testid={`cancel-btn-${post.id}`}
                              title="Hủy bài viết đặt lịch"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}

                        {/* View external link if published */}
                        {post.status === 'published' && post.metaPostId && (
                          <a
                            href={`https://facebook.com/${post.metaPostId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Xem trên Facebook"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground">
            <div>
              Trang <span className="font-semibold text-foreground">{meta.page}</span> /{' '}
              <span className="font-semibold text-foreground">{meta.totalPages}</span> (Tổng{' '}
              <span className="font-semibold text-foreground">{meta.total}</span> bài viết)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => changePage(Math.max(1, meta.page - 1))}
                disabled={meta.page <= 1 || isLoading}
                data-testid="pagination-prev-btn"
                className="p-1.5 rounded-lg border border-border/40 bg-card hover:bg-muted/40 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => changePage(Math.min(meta.totalPages, meta.page + 1))}
                disabled={meta.page >= meta.totalPages || isLoading}
                data-testid="pagination-next-btn"
                className="p-1.5 rounded-lg border border-border/40 bg-card hover:bg-muted/40 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
