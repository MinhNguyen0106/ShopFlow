'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { CommandPalette } from './command-palette';
import { usePageStore } from '@/lib/page.store';

interface MacWindowShellProps {
  children: React.ReactNode;
}

export function MacWindowShell({ children }: MacWindowShellProps) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { fetchPages } = usePageStore();

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return (
    <div className="h-screen w-full bg-white flex overflow-hidden">
      {/* 1. Sidebar bên trái kéo dài trọn vẹn từ đỉnh tới đáy màn hình */}
      <Sidebar />

      {/* 2. Khu vực bên phải: Topbar trên cùng + Main Workspace bên dưới */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

        {/* Scrollable Main Workspace - 100% Fluid Width */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 w-full">
          {children}
        </main>
      </div>

      {/* Global Command Palette Spotlight (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
