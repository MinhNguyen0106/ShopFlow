'use client';

/**
 * ShopFlow - Post Creator Page
 * Route: /posts/new
 * File: frontend/src/app/(dashboard)/posts/new/page.tsx
 *
 * Màn hình soạn thảo bài viết mới & Live Preview Facebook (TASK-17).
 * Bố cục Split-Pane chuẩn macOS Clean Utility, kết nối Cloudinary upload và API đặt lịch.
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Calendar,
  Eye,
  Maximize2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { usePageStore } from '@/lib/page.store';
import { apiClient } from '@/lib/api-client';
import { PostMediaType } from '@/types/post';
import { PostEditor } from '@/components/posts/post-editor';
import { MediaUploader } from '@/components/posts/media-uploader';
import { SchedulePicker, PublishMode } from '@/components/posts/schedule-picker';
import {
  FacebookPostCard,
  PostPreviewModal,
} from '@/components/posts/post-preview-modal';

export default function NewPostPage() {
  const router = useRouter();
  const { pages, fetchPages } = usePageStore();

  // Form State
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [contentText, setContentText] = useState<string>('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<PostMediaType>('none');
  const [publishMode, setPublishMode] = useState<PublishMode>('schedule');
  const [scheduledTime, setScheduledTime] = useState<string>(() => {
    // Mặc định hẹn sau 30 phút
    return new Date(Date.now() + 30 * 60 * 1000).toISOString();
  });
  const [isScheduleValid, setIsScheduleValid] = useState<boolean>(true);

  // UI State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Tải danh sách fanpages khi vào trang
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Tự động chọn fanpage đầu tiên nếu chưa chọn
  useEffect(() => {
    if (!selectedPageId && pages.length > 0) {
      setSelectedPageId(pages[0].pageId);
    }
  }, [pages, selectedPageId]);

  // Tên fanpage đang được chọn để preview
  const selectedPageObj = pages.find((p) => p.pageId === selectedPageId);
  const selectedPageName = selectedPageObj ? selectedPageObj.pageName : 'ShopFlow Fanpage';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Client Validation
    if (!selectedPageId) {
      setSubmitError('Vui lòng chọn Fanpage mục tiêu để xuất bản bài viết.');
      return;
    }

    if (!contentText.trim() && mediaUrls.length === 0) {
      setSubmitError('Vui lòng nhập nội dung bài viết hoặc đính kèm ít nhất một hình ảnh / video.');
      return;
    }

    if (publishMode === 'schedule' && !isScheduleValid) {
      setSubmitError('Thời gian đặt lịch không hợp lệ. Vui lòng chọn thời điểm cách hiện tại ít nhất 10 phút.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Nếu là 'now', tính thời điểm cách 10 phút để đảm bảo hợp lệ qua worker backend
      const finalScheduledTime =
        publishMode === 'now'
          ? new Date(Date.now() + 10 * 60 * 1000).toISOString()
          : scheduledTime;

      const payload = {
        pageId: selectedPageId,
        contentText: contentText.trim(),
        mediaType,
        mediaUrls,
        scheduledTime: finalScheduledTime,
      };

      const response = await apiClient.post('/posts', payload);

      if (response.data?.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/posts');
        }, 1200);
      } else {
        throw new Error(response.data?.message || 'Không thể tạo bài viết.');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Đã xảy ra lỗi khi tạo bài viết. Vui lòng thử lại.';
      setSubmitError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto w-full">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Link
            href="/posts"
            data-testid="back-to-posts-btn"
            className="p-2 rounded-xl border border-border/50 bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
            title="Quay lại danh sách bài viết"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Soạn Thảo Bài Viết Mới
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="w-3 h-3" />
                Chuẩn Facebook Feed
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Soạn thảo bài viết, tải lên hình ảnh/video và lên lịch xuất bản tự động lên Fanpage.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            data-testid="open-preview-modal-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/50 bg-card hover:bg-muted/40 text-xs font-semibold text-foreground transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-primary" />
            <span>Xem trước</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || submitSuccess}
            data-testid="submit-post-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Thành công!</span>
              </>
            ) : publishMode === 'now' ? (
              <>
                <Send className="w-4 h-4" />
                <span>Đăng ngay</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Lên lịch xuất bản</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Success Notifications */}
      {submitError && (
        <div
          data-testid="post-submit-error"
          className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div
          data-testid="post-submit-success"
          className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 animate-in fade-in duration-150"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Bài viết đã được lên lịch thành công! Đang chuyển hướng về trang danh sách...</span>
        </div>
      )}

      {/* Main Split-Pane Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editor & Configuration Form (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-md shadow-sm space-y-6">
            {/* 1. Post Text & Fanpage Editor */}
            <PostEditor
              content={contentText}
              onChange={setContentText}
              selectedPageId={selectedPageId}
              onPageChange={setSelectedPageId}
              pages={pages}
              disabled={isSubmitting}
            />

            {/* Divider */}
            <hr className="border-border/40" />

            {/* 2. Media Uploader */}
            <MediaUploader
              mediaUrls={mediaUrls}
              mediaType={mediaType}
              onChange={(urls, type) => {
                setMediaUrls(urls);
                setMediaType(type);
              }}
              disabled={isSubmitting}
            />

            {/* Divider */}
            <hr className="border-border/40" />

            {/* 3. Schedule Time Picker */}
            <SchedulePicker
              publishMode={publishMode}
              scheduledTime={scheduledTime}
              onPublishModeChange={setPublishMode}
              onScheduledTimeChange={(time, valid) => {
                setScheduledTime(time);
                setIsScheduleValid(valid);
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column: Instant Live Preview (5/12 - Sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-primary" />
              Xem trước tức thời (Live Preview)
            </span>
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              title="Phóng to xem trước đầy đủ"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Maximize2 className="w-3 h-3" />
              Mở rộng
            </button>
          </div>

          {/* Facebook Post Mockup Container */}
          <div className="rounded-2xl border border-border/50 p-2 bg-muted/20 backdrop-blur-sm shadow-sm">
            <FacebookPostCard
              pageName={selectedPageName}
              contentText={contentText}
              mediaUrls={mediaUrls}
              mediaType={mediaType}
              scheduledTime={scheduledTime}
              publishMode={publishMode}
              deviceMode="desktop"
            />
          </div>
        </div>
      </div>

      {/* Full-Screen Preview Modal (Desktop & Mobile Switcher) */}
      <PostPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        pageName={selectedPageName}
        contentText={contentText}
        mediaUrls={mediaUrls}
        mediaType={mediaType}
        scheduledTime={scheduledTime}
        publishMode={publishMode}
      />
    </div>
  );
}
