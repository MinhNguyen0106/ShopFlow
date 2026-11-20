'use client';

import React from 'react';
import {
  Zap,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  Lock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* =========================================================================
          NỬA TRÁI (LEFT HALF): Visual Showcase Thương Hiệu ShopFlow (Desktop Only)
          ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-12 xl:p-16 flex-col justify-between overflow-hidden border-r border-slate-800/80">
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                ShopFlow
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                SaaS VN
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-md font-medium leading-relaxed">
            Nền tảng tự động hóa quản lý Fanpage Facebook, Live Chat đa kênh và Khiên bảo vệ ẩn số điện thoại chống cướp đơn số 1 Việt Nam.
          </p>
        </div>

        {/* Visual Feature Bento Cards Showcase */}
        <div className="relative z-10 my-auto py-8 space-y-4 max-w-lg">
          {/* Card 1: Khiên Ẩn Số Điện Thoại */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl shadow-black/20 hover:bg-white/[0.08] transition-all duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-white tracking-wide uppercase">
                    Khiên Ẩn Số Điện Thoại
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    SLA &lt; 0.28s
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Tự động ẩn bình luận chứa SĐT khách hàng, ngăn chặn đối thủ cướp đơn 100%.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Live Chat & AI Bot */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl shadow-black/20 hover:bg-white/[0.08] transition-all duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-white tracking-wide uppercase">
                    Live Chat &amp; Tin Nhắn Đa Kênh
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded-full">
                    ⚡ Phản hồi &lt; 5s
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Đồng bộ tin nhắn tức thời qua Webhook Meta Graph API v19+ và Socket.io.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: AI Gemini 2.5 Chốt Đơn */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl shadow-black/20 hover:bg-white/[0.08] transition-all duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-semibold text-white tracking-wide uppercase">
                    AI Gemini Chốt Đơn Tự Động
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +300% Doanh Thu
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Trích xuất mã sản phẩm, kích cỡ và tạo đơn hàng tự động vào cơ sở dữ liệu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof & Metrics Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80">
          <div className="grid grid-cols-3 gap-4 text-left">
            <div>
              <div className="text-lg font-bold text-white">10,000+</div>
              <div className="text-[11px] text-slate-400">Chủ shop tin dùng</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">99.9%</div>
              <div className="text-[11px] text-slate-400">Uptime hệ thống</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-lg font-bold text-blue-400">
                <Lock className="w-4 h-4" />
                <span>AES-256</span>
              </div>
              <div className="text-[11px] text-slate-400">Mã hóa an toàn</div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          NỬA PHẢI (RIGHT HALF): Khu Vực Form Đăng Nhập / Đăng Ký
          ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between bg-white px-6 py-8 sm:px-12 lg:px-16 xl:px-20 overflow-y-auto">
        {/* Mobile Header (hiển thị khi màn hình nhỏ < lg) */}
        <div className="lg:hidden flex items-center justify-between pb-6 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">ShopFlow</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200">
              SaaS VN
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Bảo mật AES-256
          </span>
        </div>

        {/* Form Container (Căn giữa theo chiều dọc) */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {children}
        </div>

        {/* Right Footer */}
        <footer className="pt-6 mt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          &copy; 2026 ShopFlow E-Commerce Suite. Bản quyền thuộc về ShopFlow Việt Nam.
        </footer>
      </div>
    </div>
  );
}
