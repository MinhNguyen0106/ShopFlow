'use client';

/**
 * ShopFlow - Post Status Badge Component
 * File: frontend/src/components/posts/post-status-badge.tsx
 *
 * Hiển thị huy hiệu trạng thái bài viết theo ngôn ngữ thiết kế macOS Clean Utility.
 */

import React from 'react';
import { PostStatus } from '../../types/post';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Ban } from 'lucide-react';

interface PostStatusBadgeProps {
  status: PostStatus;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<
  PostStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    containerClass: string;
    dotClass: string;
  }
> = {
  published: {
    label: 'Đã xuất bản',
    icon: CheckCircle2,
    containerClass:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
    dotClass: 'bg-emerald-400',
  },
  scheduled: {
    label: 'Đã lên lịch',
    icon: Clock,
    containerClass:
      'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/15',
    dotClass: 'bg-sky-400',
  },
  pending: {
    label: 'Đang xử lý',
    icon: AlertCircle,
    containerClass:
      'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
    dotClass: 'bg-amber-400 animate-pulse',
  },
  failed: {
    label: 'Lỗi xuất bản',
    icon: AlertTriangle,
    containerClass:
      'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/15',
    dotClass: 'bg-rose-400',
  },
  cancelled: {
    label: 'Đã hủy',
    icon: Ban,
    containerClass:
      'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/15',
    dotClass: 'bg-zinc-400',
  },
};

export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      data-testid={`post-status-badge-${status}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${config.containerClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className="truncate">{config.label}</span>
    </span>
  );
};
