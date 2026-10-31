'use client';

import React, { useState, useEffect } from 'react';
import { MacTrafficLights } from './mac-traffic-lights';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from './command-palette';
import { Lock } from 'lucide-react';
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsMaximized(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsMaximized(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsMaximized(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* 1. macOS Window Topbar (Traffic Lights & System Status) - Edge-to-Edge Full Width */}
      <div className="h-10 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between select-none shrink-0 w-full">
        {/* Traffic Light Buttons */}
        <MacTrafficLights
          onMaximize={handleToggleFullscreen}
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
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Right Section: Topbar + Main Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />

          {/* Scrollable Main Workspace - 100% Fluid Width */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 w-full">
            {children}
          </main>
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
