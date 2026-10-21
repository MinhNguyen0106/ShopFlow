'use client';

/**
 * ShopFlow - Posts Calendar View Component
 * File: frontend/src/components/posts/posts-calendar-view.tsx
 *
 * Hiển thị lịch biểu trực quan dạng tháng với CSS Grid thuần, nhận diện khung giờ vàng.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCw,
  Trash2,
  X,
  FileText,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { usePostStore } from '../../lib/post.store';
import { PostStatusBadge } from './post-status-badge';
import { ScheduledPostItem } from '../../types/post';

const DAYS_OF_WEEK = [
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
  'Chủ nhật',
];

// Khung giờ vàng tại Việt Nam: 11h - 13h trưa & 19h30 - 21h30 tối
const isGoldenHour = (dateStr: string): boolean => {
  try {
    const d = new Date(dateStr);
    const hour = d.getHours();
    const minute = d.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    // 11:00 (660m) - 13:00 (780m)
    if (timeInMinutes >= 660 && timeInMinutes <= 780) return true;
    // 19:30 (1170m) - 21:30 (1290m)
    if (timeInMinutes >= 1170 && timeInMinutes <= 1290) return true;
    return false;
  } catch {
    return false;
  }
};

export const PostsCalendarView: React.FC = () => {
  const { posts, setDateRange, retryPost, cancelPost, isActionLoading } = usePostStore();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedPost, setSelectedPost] = useState<ScheduledPostItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Tự động cập nhật khoảng thời gian filter khi đổi tháng
  useEffect(() => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    setDateRange(startOfMonth.toISOString(), endOfMonth.toISOString());
  }, [year, month, setDateRange]);

  // Điều hướng tháng
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Tính toán các ngày trong lưới lịch
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Thứ trong tuần của ngày 1 (0 là CN, 1 là T2, ... 6 là T7). Ta quy đổi Thứ 2 = 0 ... CN = 6
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateKey: string;
    }> = [];

    // Ngày của tháng trước
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        dateKey,
      });
    }

    // Ngày của tháng hiện tại
    const today = new Date();
    const isCurrentYearMonth =
      today.getFullYear() === year && today.getMonth() === month;

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isCurrentYearMonth && today.getDate() === i,
        dateKey,
      });
    }

    // Ngày của tháng sau để lưới đủ bội số của 7 (thường là 35 hoặc 42 ô)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        dateKey,
      });
    }

    return days;
  }, [year, month]);

  // Gom nhóm bài viết theo ngày `YYYY-MM-DD`
  const postsByDate = useMemo(() => {
    const map = new Map<string, ScheduledPostItem[]>();
    for (const post of posts) {
      const scheduledTime = post.scheduledTime || post.scheduled_time;
      if (!scheduledTime) continue;
      try {
        const d = new Date(scheduledTime);
        if (isNaN(d.getTime())) continue;
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(post);
      } catch {
        // bỏ qua ngày lỗi
      }
    }
    return map;
  }, [posts]);

  const monthTitle = new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const formatTimeOnly = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card/60 border border-border/50 rounded-2xl backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold capitalize text-foreground">
              {monthTitle}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="inline-flex items-center gap-1 text-amber-400">
                <Sparkles className="w-3 h-3" />
                Giờ vàng: 11h-13h & 19h30-21h30
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            data-testid="calendar-today-btn"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border/50 bg-background hover:bg-muted/40 transition-all"
          >
            Hôm nay
          </button>
          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden bg-background">
            <button
              onClick={handlePrevMonth}
              data-testid="calendar-prev-month-btn"
              title="Tháng trước"
              className="p-1.5 hover:bg-muted/40 transition-all border-r border-border/40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              data-testid="calendar-next-month-btn"
              title="Tháng sau"
              className="p-1.5 hover:bg-muted/40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="w-full bg-card/60 border border-border/50 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30 text-center text-xs font-semibold text-muted-foreground py-2.5">
          {DAYS_OF_WEEK.map((dayName, idx) => (
            <div key={dayName} className={idx >= 5 ? 'text-primary/80' : ''}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-border/30 bg-background/50">
          {calendarDays.map((cell) => {
            const dayPosts = postsByDate.get(cell.dateKey) || [];

            return (
              <div
                key={cell.dateKey}
                data-testid={`calendar-cell-${cell.dateKey}`}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth
                    ? 'bg-card/30 hover:bg-muted/15'
                    : 'bg-muted/10 opacity-40'
                }`}
              >
                {/* Cell Header: Date Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      cell.isToday
                        ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {dayPosts.length} bài
                    </span>
                  )}
                </div>

                {/* Day Posts List */}
                <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                  {dayPosts.slice(0, 3).map((post) => {
                    const scheduledTime = post.scheduledTime || post.scheduled_time || '';
                    const golden = isGoldenHour(scheduledTime);
                    const timeStr = formatTimeOnly(scheduledTime);
                    const content = post.contentText || post.content_text || '(Không có chữ)';

                    // Color indicator based on post status
                    let statusColor = 'bg-sky-400';
                    if (post.status === 'published') statusColor = 'bg-emerald-400';
                    if (post.status === 'failed') statusColor = 'bg-rose-400';
                    if (post.status === 'pending') statusColor = 'bg-amber-400';
                    if (post.status === 'cancelled') statusColor = 'bg-zinc-400';

                    return (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        data-testid={`calendar-post-${post.id}`}
                        className={`w-full text-left p-1.5 rounded-md border text-[11px] transition-all flex items-start gap-1.5 group/post ${
                          golden
                            ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-background/80 border-border/40 hover:bg-muted/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${statusColor}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                            <span>{timeStr}</span>
                            {golden && (
                              <span title="Khung giờ vàng" className="inline-flex">
                                <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="truncate text-foreground font-medium leading-tight mt-0.5">
                            {content}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  {dayPosts.length > 3 && (
                    <button
                      onClick={() => setSelectedPost(dayPosts[3])}
                      className="text-[10px] text-primary hover:underline font-medium w-full text-center py-0.5"
                    >
                      +{dayPosts.length - 3} bài nữa...
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick View Post Modal */}
      {selectedPost && (
        <div
          data-testid="calendar-post-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <PostStatusBadge status={selectedPost.status} />
                {isGoldenHour(selectedPost.scheduledTime || selectedPost.scheduled_time || '') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Sparkles className="w-3 h-3" />
                    Giờ vàng
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                data-testid="close-modal-btn"
                className="p-1 rounded-lg hover:bg-muted/40 text-muted-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nội dung bài viết
                </span>
                <p className="mt-1 text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-3 rounded-xl border border-border/30">
                  {selectedPost.contentText ||
                    selectedPost.content_text ||
                    '(Không có nội dung chữ)'}
                </p>
              </div>

              {/* Media Preview */}
              {(selectedPost.mediaUrls || selectedPost.media_urls || []).length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phương tiện đính kèm
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {(selectedPost.mediaUrls || selectedPost.media_urls || []).map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden border border-border/40 bg-muted/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Media ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timing & Page Details */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    Hẹn giờ:{' '}
                    <strong className="text-foreground">
                      {new Intl.DateTimeFormat('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(selectedPost.scheduledTime || selectedPost.scheduled_time || ''))}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>
                    Fanpage:{' '}
                    <strong className="text-foreground">
                      {selectedPost.pageId || selectedPost.page_id || 'Chung'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Error Details */}
              {selectedPost.status === 'failed' &&
                (selectedPost.errorMessage || selectedPost.error_message) && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                    <strong>Lý do lỗi:</strong>{' '}
                    {selectedPost.errorMessage || selectedPost.error_message}
                  </div>
                )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-2">
              {selectedPost.status === 'failed' && (
                <button
                  onClick={async () => {
                    await retryPost(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  disabled={isActionLoading}
                  data-testid="modal-retry-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Thử lại ngay
                </button>
              )}

              {(selectedPost.status === 'pending' || selectedPost.status === 'scheduled') && (
                <button
                  onClick={async () => {
                    await cancelPost(selectedPost.id);
                    setSelectedPost(null);
                  }}
                  disabled={isActionLoading}
                  data-testid="modal-cancel-btn"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hủy lịch đăng
                </button>
              )}

              <button
                onClick={() => setSelectedPost(null)}
                className="px-3 py-1.5 rounded-lg text-xs border border-border/50 hover:bg-muted/40 transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
