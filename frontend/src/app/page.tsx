import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* macOS Floating Window Container */}
      <div className="w-full max-w-3xl overflow-hidden rounded-mac-window border border-slate-200/80 bg-white shadow-mac-window">
        {/* macOS Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-mac-close" />
            <span className="h-3 w-3 rounded-full bg-mac-minimize" />
            <span className="h-3 w-3 rounded-full bg-mac-maximize" />
          </div>
          <span className="text-xs font-medium text-slate-500">
            ShopFlow Enterprise • macOS Clean Utility v1.0
          </span>
          <div className="w-12" />
        </div>

        {/* Content Body */}
        <div className="p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-inner">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Chào mừng đến với <span className="text-primary-600">ShopFlow</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base text-slate-600 leading-relaxed">
            Nền tảng tự động hóa Fanpage Facebook, lên lịch bài đăng thông minh,
            Live Chat đa kênh và Khiên bảo vệ ẩn số điện thoại chống cướp đơn hàng đầu Việt Nam.
          </p>

          {/* Quick Metrics Pills */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 border border-emerald-200/60">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Meta Graph API v19 Active
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 border border-blue-200/60">
              ⚡ Webhook Latency &lt; 42ms
            </span>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-purple-700 border border-purple-200/60">
              🛡️ Khiên Ẩn SĐT &lt; 0.28s
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary-600 px-7 py-3 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              Đăng Nhập Dashboard
            </Link>
            <a
              href="http://localhost:5000/health"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Kiểm Tra Backend API Status
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-center text-xs text-slate-400">
          ShopFlow Monorepo Architecture: <code className="font-mono text-slate-600">apps/backend</code> (Express) &amp; <code className="font-mono text-slate-600">apps/frontend</code> (Next.js 14)
        </div>
      </div>
    </main>
  );
}
