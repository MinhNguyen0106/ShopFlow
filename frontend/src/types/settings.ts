/**
 * ShopFlow - Settings Types
 * File: frontend/src/types/settings.ts
 */

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin' | 'staff' | string;
  status: 'active' | 'inactive' | 'suspended' | string;
  phone?: string | null;
  brandName?: string | null;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface MetaRateLimitInfo {
  callsUsed: number;
  totalLimit: number;
  usagePercent: number;
  callsPerMinute: number;
  status: 'safe' | 'warning' | 'exceeded';
  resetHoursLeft: number;
}

export interface WebhookHealthInfo {
  status: 'active' | 'degraded' | 'offline';
  signatureAlgorithm: string;
  timingSafeCheck: boolean;
  redisIdempotencyTtlHours: number;
  avgLatencyMs: number;
}

export interface FanpageLimitItem {
  pageId: string;
  pageName: string;
  isActive: boolean;
  webhookSubscribed: boolean;
  tokenDaysLeft: number;
}

export interface MetaLimitsData {
  rateLimit: MetaRateLimitInfo;
  webhookHealth: WebhookHealthInfo;
  fanpages: FanpageLimitItem[];
}
