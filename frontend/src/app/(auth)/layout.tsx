'use client';

import React from 'react';
import { MacTrafficLights } from '@/components/layout/mac-traffic-lights';
import { Lock } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-blueprint-grid text-slate-800 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Decorative Ambient Bar */}
      <header className="w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

      {/* Main Canvas Wrapper */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* macOS Centered Window Container (560px max-width) */}
        <div className="w-full max-w-[560px] bg-white rounded-[24px] border border-slate-200/90 shadow-mac-window overflow-hidden transition-all duration-300">
          {/* macOS Window Topbar */}
          <div className="h-11 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between select-none">
            <MacTrafficLights />

            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>ShopFlow — Cổng Xác Thực Hệ Thống</span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">Hệ thống ổn định (v2.4)</span>
            </div>
          </div>

          {/* Window Body Content */}
          <div className="p-6 sm:p-8">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400">
        &copy; 2026 ShopFlow E-Commerce Suite. Bảo mật thông tin mã hóa chuẩn AES-256 GCM.
      </footer>
    </div>
  );
}
