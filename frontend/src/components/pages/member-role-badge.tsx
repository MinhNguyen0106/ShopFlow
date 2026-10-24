'use client';

import React from 'react';
import { Crown, ShieldCheck, UserCheck } from 'lucide-react';
import { PageRole } from '@/types/page-member';

interface MemberRoleBadgeProps {
  role: PageRole;
  className?: string;
  showIcon?: boolean;
}

export function MemberRoleBadge({
  role,
  className = '',
  showIcon = true,
}: MemberRoleBadgeProps) {
  switch (role) {
    case 'owner':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm ${className}`}
        >
          {showIcon && <Crown className="w-3 h-3 text-purple-400" />}
          <span>Chủ sở hữu</span>
        </span>
      );
    case 'manager':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3 h-3 text-blue-400" />}
          <span>Quản lý</span>
        </span>
      );
    case 'staff':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm ${className}`}
        >
          {showIcon && <UserCheck className="w-3 h-3 text-emerald-400" />}
          <span>Nhân viên</span>
        </span>
      );
  }
}
