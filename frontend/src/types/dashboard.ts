/**
 * ShopFlow - Dashboard Overview Types & Helper Interfaces
 * File: frontend/src/types/dashboard.ts
 *
 * Định nghĩa hợp đồng dữ liệu cho màn hình Bảng điều khiển Tổng quan (TASK-19)
 */

export interface DashboardMetrics {
  newConversationsToday: number;
  conversationsGrowthPercent: number;
  hiddenPhoneCount: number;
  hiddenPhoneAvgResponseSeconds: number;
  scheduledPostsToday: number;
  metaWindowComplianceRate: number;
}

export const DEFAULT_DASHBOARD_METRICS: DashboardMetrics = {
  newConversationsToday: 1248,
  conversationsGrowthPercent: 18.5,
  hiddenPhoneCount: 342,
  hiddenPhoneAvgResponseSeconds: 1.8,
  scheduledPostsToday: 8,
  metaWindowComplianceRate: 99.4,
};

export interface HourlyTrafficPoint {
  hour: string;
  label: string;
  interactions: number;
  isGoldenHour?: boolean;
  goldenHourLabel?: string;
}

export interface MetaWindowLead {
  id: string;
  customerName: string;
  customerAvatar?: string;
  phone?: string;
  lastMessage: string;
  remainingMinutes: number;
  pageName: string;
  isUrgent: boolean;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: 'edit' | 'inbox' | 'pages' | 'bot';
  badge?: string;
  accentColor: string;
}

/**
 * Tiện ích che số điện thoại bảo vệ PII (Security First)
 * Ví dụ: "0987654321" -> "098****321"
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.length < 7) return clean;
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-3);
  return `${prefix}****${suffix}`;
}
