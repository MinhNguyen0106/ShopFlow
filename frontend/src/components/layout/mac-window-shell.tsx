'use client';

import React, { useState, useEffect } from 'react';
import { MacTrafficLights } from './mac-traffic-lights';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from './command-palette';
import { Lock, Sparkles } from 'lucide-react';
import { usePageStore } from '@/lib/page.store';

interface MacWindowShellProps {
  children: React.ReactNode;
}

export function MacWindowShell({ children }: MacWindowShellProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const { fetchPages } = usePageStore();

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return (
    <div className="min-h-screen bg-blueprint-grid p-2 sm:p-4 md:p-6 flex flex-col justify-center items-center">
      {/* macOS Window Outer Container */}
      <div
        className={`w-full bg-white rounded-[24px] border border-slate-200/90 shadow-mac-window overflow-hidden flex flex-col transition-all duration-300 ${
          isMaximized ? 'fixed inset-2 z-40 rounded-none' : 'max-w-[1560px] min-h-[92vh]'
        }`}
      >
        {/* 1. macOS Window Topbar (Traffic Lights & System Status) */}
        <div className="h-10 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between select-none shrink-0">
          {/* Traffic Light Buttons */}
          <MacTrafficLights
            onMaximize={() => setIsMaximized(!isMaximized)}
            onMinimize={() => {}}
            onClose={() => {}}
          />

          {/* Window Center Title */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>ShopFlow — Nền Tảng Tự Động Hóa Fanpage &amp; Quản Lý Bán Hàng</span>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ thống ổn định (v2.4)</span>
          </div>
        </div>

        {/* 2. Window Content Area: Sidebar + Topbar + Main Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Right Section: Topbar + Main Canvas */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />

            {/* Scrollable Main Workspace */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Global Command Palette Spotlight (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
