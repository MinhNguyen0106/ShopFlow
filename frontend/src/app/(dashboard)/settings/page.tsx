'use client';

/**
 * ShopFlow - System Settings & Profile Dashboard Page (TASK-28)
 * Route: /settings
 * File: frontend/src/app/(dashboard)/settings/page.tsx
 *
 * Màn hình quản trị Cài đặt Hệ thống, Hồ sơ cá nhân và Giám sát Meta Graph API Limits.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Shield,
  Gauge,
  ChevronRight,
} from 'lucide-react';
import { ProfileSettingsTab } from '@/components/settings/profile-settings-tab';
import { SecurityPasswordTab } from '@/components/settings/security-password-tab';
import { ApiLimitsMonitorTab } from '@/components/settings/api-limits-monitor-tab';

export type SettingsTabId = 'profile' | 'security' | 'meta-limits';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      name: 'Hồ sơ & Tài khoản',
      icon: User,
      badge: 'Verified',
    },
    {
      id: 'security' as const,
      name: 'Bảo mật & Mật khẩu',
      icon: Shield,
    },
    {
      id: 'meta-limits' as const,
      name: 'Giám sát Meta Graph API & Webhooks',
      icon: Gauge,
      isLive: true,
    },
  ];

  return (
    <div className="flex-1 space-y-6 w-full max-w-[1400px] mx-auto pb-12">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            ShopFlow
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Cài Đặt Hệ Thống</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-primary-600 font-semibold">
            {activeTab === 'profile'
              ? 'Hồ sơ & Tài khoản'
              : activeTab === 'security'
              ? 'Bảo mật & Mật khẩu'
              : 'Giám sát Meta API'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Cài đặt Hệ thống &amp; Hồ sơ
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Trung tâm quản trị hồ sơ cá nhân, cập nhật mật khẩu và giám sát kỹ thuật hạn mức Meta Graph API v19.0.
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20'
                  : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.name}</span>

              {tab.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-primary-700 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {tab.isLive && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'profile' && <ProfileSettingsTab />}
        {activeTab === 'security' && <SecurityPasswordTab />}
        {activeTab === 'meta-limits' && <ApiLimitsMonitorTab />}
      </div>
    </div>
  );
}
