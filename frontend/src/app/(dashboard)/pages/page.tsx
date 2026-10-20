'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  MoreVertical,
  MessageSquare,
  Bot,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Activity,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { usePageStore, ConnectedPage } from '@/lib/page.store';
import { apiClient } from '@/lib/api-client';
import { ConnectPageModal } from '@/components/pages/connect-page-modal';

export default function PagesManagementPage() {
  const router = useRouter();
  const {
    pages,
    isLoading,
    fetchPages,
    togglePageActive,
    disconnectPage,
    selectPage,
  } = usePageStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Đã sao chép Page ID: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartOAuth = async () => {
    setIsConnectingOAuth(true);
    try {
      const res = await apiClient.get('/fb-oauth/connect-url');
      const oauthUrl = res.data?.data?.url;
      if (oauthUrl) {
        // Mở popup OAuth Meta
        const width = 600;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        window.open(
          oauthUrl,
          'MetaOAuth',
          `width=${width},height=${height},top=${top},left=${left}`
        );
      }
      // Đồng thời mở modal chọn page
      setIsConnectModalOpen(true);
    } catch {
      showToast('Không thể kết nối Meta OAuth. Vui lòng thử lại.');
    } finally {
      setIsConnectingOAuth(false);
    }
  };

  const handleToggleActive = async (page: ConnectedPage) => {
    const success = await togglePageActive(page.id, !page.isActive);
    if (success) {
      showToast(
        !page.isActive
          ? `Đã bật tiếp nhận cho ${page.pageName}`
          : `Đã tạm dừng tiếp nhận cho ${page.pageName}`
      );
    }
  };

  const handleDisconnect = async (page: ConnectedPage) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ngắt kết nối Fanpage "${page.pageName}" không? Webhook sẽ ngừng nhận dữ liệu.`
      )
    ) {
      const success = await disconnectPage(page.id);
      if (success) {
        showToast(`Đã ngắt kết nối Fanpage ${page.pageName}`);
      }
    }
    setActiveMenuId(null);
  };

  const handleEnterInbox = (page: ConnectedPage) => {
    selectPage(page);
    router.push('/inbox');
  };

  const activePagesCount = pages.filter((p) => p.isActive).length;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>ShopFlow Workspace</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span>Kênh tiếp thị &amp; Social</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-blue-600 font-semibold">
              Quản lý Fanpage &amp; Kênh bán hàng
            </span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Quản lý Fanpage &amp; Kênh bán hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
            Kết nối API trực tiếp qua Meta Graph API v19+, quản lý phân quyền và đồng bộ tin nhắn/bình luận theo thời gian thực.
          </p>
        </div>

        {/* Top Action CTAs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchPages();
              showToast('Đang làm mới trạng thái các Fanpage...');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-blue-600 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            <span>Đồng bộ lại tất cả Webhooks</span>
          </button>

          <button
            type="button"
            disabled={isConnectingOAuth}
            onClick={handleStartOAuth}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            {isConnectingOAuth ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>+ Thêm Fanpage Mới (Meta OAuth)</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số trang */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Tổng số trang kết nối</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {pages.length} / 5
            </span>
            <span className="text-xs text-slate-400 font-medium">trang (Gói Pro)</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.min((pages.length / 5) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Trạng thái Webhook */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Trạng thái Webhook &amp; Token</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">
              {pages.length > 0 ? '100% Hoạt động' : 'Chưa có kết nối'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            Token Meta Long-Lived hợp lệ 58 ngày nữa
          </p>
        </div>

        {/* Card 3: Lưu lượng hôm nay */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Lưu lượng hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">1,428</span>
            <span className="text-xs font-semibold text-emerald-600">+14.2%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tự động hóa xử lý 88% tương tác
          </p>
        </div>

        {/* Card 4: Tốc độ phản hồi SLA */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Tốc độ phản hồi trung bình</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">1.4s</span>
            <span className="text-xs font-medium text-emerald-600">
              (SLA &lt; 3.0s)
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ẩn bình luận SĐT nhanh 0.3s
          </p>
        </div>
      </div>

      {/* PageCard Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Danh sách Fanpage đang liên kết ({pages.length})
          </h2>
          <span className="text-xs text-slate-400">
            Đang bật tiếp nhận: {activePagesCount} / {pages.length} trang
          </span>
        </div>

        {pages.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chưa có Fanpage nào được kết nối
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Hãy liên kết tài khoản Meta Facebook để bắt đầu tự động hóa tin nhắn, trả lời bình luận và bảo vệ số điện thoại khách hàng.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartOAuth}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Kết Nối Fanpage Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pages.map((page) => {
              const isWebhookActive = page.isActive && page.webhookSubscribed;
              const isPaused = !page.isActive;

              return (
                <div
                  key={page.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  {/* Card Header: Avatar & Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md shadow-blue-500/20">
                          {page.pageName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {page.pageName}
                          </h3>
                          <p className="text-xs text-slate-400 truncate">
                            {page.category || 'Trang kinh doanh'}
                          </p>
                        </div>
                      </div>

                      {/* Menu Options */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(
                              activeMenuId === page.id ? null : page.id
                            )
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === page.id && (
                          <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              type="button"
                              onClick={() => handleEnterInbox(page)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>Vào Hộp Thư</span>
                            </button>
                            <Link
                              href="/automation"
                              onClick={() => setActiveMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left"
                            >
                              <Bot className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Cấu hình Bot</span>
                            </Link>
                            <div className="my-1 border-t border-slate-100" />
                            <button
                              type="button"
                              onClick={() => handleDisconnect(page)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Ngắt kết nối trang</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Page ID with Copy */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 truncate">
                        <span className="text-slate-400">ID:</span>
                        <span className="font-semibold">{page.pageId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(page.id, page.pageId)}
                        title="Sao chép Page ID"
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        {copiedId === page.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Webhook Status Badge */}
                    <div className="flex items-center gap-2">
                      {isPaused ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Đã tạm dừng tiếp nhận</span>
                        </span>
                      ) : isWebhookActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Đang đồng bộ Webhook</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200/60">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Cần cấp lại Token</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Toggle Switch & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Switch Button */}
                      <button
                        type="button"
                        aria-label="Bật tắt tiếp nhận"
                        onClick={() => handleToggleActive(page)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          page.isActive ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            page.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs text-slate-600 font-medium select-none">
                        {page.isActive ? 'Đang bật' : 'Tạm dừng'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEnterInbox(page)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      <span>Vào Hộp Thư</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compliance & Security Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Meta Business Partner &amp; Tiêu chuẩn Bảo mật Dữ liệu
            </h4>
            <p className="text-[11px] text-slate-500">
              ShopFlow tuân thủ nghiêm ngặt chính sách chống spam Meta Graph API v19+. Toàn bộ mã hóa chuỗi khóa bằng thuật toán AES-256 GCM.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
            TLS 1.3 / AES-256-GCM
          </span>
        </div>
      </div>

      {/* Connect Page Modal */}
      <ConnectPageModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={() => {
          fetchPages();
          showToast('Đã kết nối và đồng bộ Fanpage thành công!');
        }}
      />
    </div>
  );
}
