'use client';

/**
 * ShopFlow - Facebook Post Preview Component & Modal
 * File: frontend/src/components/posts/post-preview-modal.tsx
 *
 * Mô phỏng chân thực bảng tin Facebook Feed trên cả 2 chế độ Desktop và Mobile,
 * hỗ trợ thuật toán bố trí lưới ảnh chuẩn Facebook (1, 2, 3, 4+ ảnh).
 */

import React, { useState } from 'react';
import {
  X,
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Monitor,
  Smartphone,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { PostMediaType } from '../../types/post';

export interface FacebookPostPreviewProps {
  pageName?: string;
  contentText: string;
  mediaUrls: string[];
  mediaType: PostMediaType;
  scheduledTime?: string;
  publishMode?: 'now' | 'schedule';
  deviceMode?: 'desktop' | 'mobile';
}

/**
 * Hiển thị thẻ bài viết Facebook Feed mô phỏng
 */
export const FacebookPostCard: React.FC<FacebookPostPreviewProps> = ({
  pageName = 'ShopFlow Fanpage',
  contentText,
  mediaUrls,
  mediaType,
  scheduledTime,
  publishMode = 'now',
  deviceMode = 'desktop',
}) => {
  // Highlight hashtag bằng màu xanh Facebook
  const renderFormattedText = (text: string) => {
    if (!text) {
      return (
        <span className="text-zinc-400 italic">
          (Nội dung bài viết sẽ hiển thị tại đây...)
        </span>
      );
    }

    const parts = text.split(/(#[a-zA-Z0-9_À-ỹ]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-[#1877F2] font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const timeLabel = publishMode === 'now'
    ? 'Vừa xong'
    : scheduledTime
    ? `Dự kiến: ${new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(scheduledTime))}`
    : 'Lên lịch';

  return (
    <div
      data-testid="facebook-post-card"
      className={`bg-card text-foreground border border-border/70 rounded-2xl overflow-hidden shadow-md font-sans transition-all ${
        deviceMode === 'mobile' ? 'max-w-[360px] mx-auto text-xs' : 'w-full text-sm'
      }`}
    >
      {/* Post Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2.5">
          {/* Fanpage Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
            {pageName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground hover:underline cursor-pointer">
                {pageName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1877F2] fill-[#1877F2]/20" />
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <span>{timeLabel}</span>
              <span>·</span>
              <Globe className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Tùy chọn bài viết"
          className="p-1.5 rounded-full hover:bg-muted/40 text-muted-foreground transition-all"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content Text */}
      <div className="px-3.5 py-3 whitespace-pre-wrap leading-relaxed">
        {renderFormattedText(contentText)}
      </div>

      {/* Post Media Grid (Thuật toán bố cục ảnh Facebook) */}
      {mediaUrls.length > 0 && (
        <div data-testid="fb-media-container" className="bg-black/95 overflow-hidden">
          {mediaType === 'video' ? (
            <div className="relative aspect-video flex items-center justify-center bg-zinc-950">
              {/* Mockup video player */}
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg ring-4 ring-white/10">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
                Video HD
              </span>
            </div>
          ) : mediaUrls.length === 1 ? (
            <div className="max-h-[460px] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrls[0]}
                alt="Post attachment"
                className="w-full h-auto max-h-[460px] object-cover"
              />
            </div>
          ) : mediaUrls.length === 2 ? (
            <div className="grid grid-cols-2 gap-0.5 aspect-[4/3]">
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="w-full h-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : mediaUrls.length === 3 ? (
            <div className="grid grid-cols-3 gap-0.5 aspect-[4/3]">
              <div className="col-span-2 h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrls[0]} alt="Photo 1" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-rows-2 gap-0.5 h-full">
                {mediaUrls.slice(1, 3).map((url, idx) => (
                  <div key={idx} className="w-full h-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // 4 ảnh hoặc nhiều hơn (Hiển thị lưới 4 ô, ô thứ 4 có lớp phủ +X)
            <div className="grid grid-cols-2 gap-0.5 aspect-square">
              {mediaUrls.slice(0, 3).map((url, idx) => (
                <div key={idx} className="w-full h-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="relative w-full h-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrls[3]} alt="Photo 4" className="w-full h-full object-cover" />
                {mediaUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-2xl font-bold">
                    +{mediaUrls.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post Feedback Stats */}
      <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/30">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[8px] font-bold">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-bold">
              ❤️
            </span>
          </span>
          <span className="ml-1">89 lượt thích</span>
        </div>
        <div className="flex items-center gap-3">
          <span>24 bình luận</span>
          <span>5 chia sẻ</span>
        </div>
      </div>

      {/* Action Buttons (Like / Comment / Share) */}
      <div className="grid grid-cols-3 p-1 text-xs font-semibold text-muted-foreground">
        <button
          type="button"
          className="py-1.5 rounded-lg hover:bg-muted/40 transition-colors flex items-center justify-center gap-1.5"
        >
          <ThumbsUp className="w-4 h-4" />
          <span>Thích</span>
        </button>
        <button
          type="button"
          className="py-1.5 rounded-lg hover:bg-muted/40 transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Bình luận</span>
        </button>
        <button
          type="button"
          className="py-1.5 rounded-lg hover:bg-muted/40 transition-colors flex items-center justify-center gap-1.5"
        >
          <Share2 className="w-4 h-4" />
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
};

interface PostPreviewModalProps extends FacebookPostPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  isOpen,
  onClose,
  ...postProps
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  return (
    <div
      data-testid="post-preview-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-2xl bg-background border border-border/70 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Xem trước bài viết trên Facebook
            </h3>
            {/* Device Switcher */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/40 border border-border/40 ml-2">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                data-testid="preview-device-desktop-btn"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  device === 'desktop'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Máy tính</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                data-testid="preview-device-mobile-btn"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  device === 'mobile'
                    ? 'bg-background text-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Điện thoại</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            data-testid="close-preview-modal-btn"
            className="p-1 rounded-lg hover:bg-muted/40 text-muted-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto bg-muted/10 flex items-center justify-center">
          <FacebookPostCard {...postProps} deviceMode={device} />
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>* Giao diện mô phỏng thuật toán hiển thị News Feed của Facebook</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-border/50 bg-card hover:bg-muted/40 text-foreground transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
