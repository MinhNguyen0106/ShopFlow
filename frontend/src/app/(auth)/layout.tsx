'use client';

import React from 'react';

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
        {/* Auth Centered Card (560px max-width) */}
        <div className="w-full max-w-[560px] bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-300">
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
