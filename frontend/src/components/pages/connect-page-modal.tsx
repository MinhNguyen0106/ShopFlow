'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Check,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { usePageStore } from '@/lib/page.store';

interface MetaAccountPage {
  id: string;
  name: string;
  category?: string;
  access_token: string;
  tasks?: string[];
  avatar_url?: string;
  is_connected?: boolean;
}

interface ConnectPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectPageModal({
  isOpen,
  onClose,
  onSuccess,
}: ConnectPageModalProps) {
  const { fetchPages } = usePageStore();
  const [accounts, setAccounts] = useState<MetaAccountPage[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = React.useCallback(() => {
    setIsLoading(true);
    setError(null);

    apiClient
      .get('/fb-oauth/accounts')
      .then((res) => {
        const rawList = res.data?.data?.pages || res.data?.data?.accounts || [];
        const normalized: MetaAccountPage[] = (Array.isArray(rawList) ? rawList : []).map(
          (item: Record<string, unknown>) => ({
            id: String(item.id || item.page_id || item.pageId || ''),
            name: String(item.name || item.page_name || item.pageName || 'Fanpage'),
            category: item.category as string | undefined,
            access_token: (item.access_token || item.accessToken || '') as string,
            tasks: (item.tasks || []) as string[],
            avatar_url: (item.avatar_url || item.avatarUrl) as string | undefined,
            is_connected: Boolean(item.is_connected || item.isConnected),
          })
        );

        setAccounts(normalized);
        // Mặc định chọn các page chưa được kết nối
        const pendingIds = normalized
          .filter((p) => !p.is_connected)
          .map((p) => p.id);
        setSelectedPageIds(pendingIds.length > 0 ? pendingIds : normalized.map((p) => p.id));
        setIsLoading(false);
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          'Chưa có tài khoản Facebook nào được liên kết hoặc phiên đã hết hạn.';
        setError(msg);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen, loadAccounts]);

  // Lắng nghe tín hiệu hoàn tất OAuth từ popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'FB_OAUTH_SUCCESS') {
        loadAccounts();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadAccounts]);

  // Hỗ trợ phím Escape để đóng nhanh modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSelectPage = (id: string) => {
    if (selectedPageIds.includes(id)) {
      setSelectedPageIds(selectedPageIds.filter((pId) => pId !== id));
    } else {
      setSelectedPageIds([...selectedPageIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedPageIds.length === accounts.length) {
      setSelectedPageIds([]);
    } else {
      setSelectedPageIds(accounts.map((a) => a.id));
    }
  };

  const handleConnectPages = async () => {
    if (selectedPageIds.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/fb-oauth/connect-pages', {
        page_ids: selectedPageIds,
        pageIds: selectedPageIds,
      });

      await fetchPages();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Không thể kết nối các Fanpage đã chọn.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerOAuth = async () => {
    try {
      const res = await apiClient.get('/fb-oauth/connect-url');
      const oauthUrl = res.data?.data?.authUrl || res.data?.data?.url;
      if (oauthUrl) {
        const width = 600;
        const height = 700;
        const left = window.innerWidth / 2 - width / 2;
        const top = window.innerHeight / 2 - height / 2;
        window.open(oauthUrl, 'MetaOAuth', `width=${width},height=${height},top=${top},left=${left}`);
      }
    } catch {
      setError('Không thể lấy đường dẫn đăng nhập Meta OAuth.');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tích chọn Fanpage kết nối
              </h2>
              <p className="text-xs text-slate-500">
                Đồng bộ Webhook tự động qua Meta Graph API v19.0
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold">{error}</p>
                  <p className="mt-1 text-slate-600">
                    Bấm nút bên dưới để mở cửa sổ cấp quyền Facebook cho Fanpage của bạn:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTriggerOAuth}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0 shadow-sm transition-all"
              >
                Đăng nhập Facebook
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs">Đang tải danh sách Fanpage từ Meta API...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  Chưa có Fanpage nào được liên kết
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Bạn cần đăng nhập tài khoản Facebook cá nhân có quyền Quản trị viên (Admin) cho các Fanpage muốn kết nối.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerOAuth}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Đăng nhập với Facebook ngay</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Tìm thấy {accounts.length} Fanpage khả dụng</span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {selectedPageIds.length === accounts.length
                    ? 'Bỏ chọn tất cả'
                    : 'Chọn tất cả'}
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isChecked = selectedPageIds.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleSelectPage(acc.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300/40'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {acc.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {acc.category || 'Trang thương mại'} • ID: {acc.id}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Admin
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Mọi Page Access Token được mã hóa AES-256 GCM độc lập trước khi lưu trữ vào cơ sở dữ liệu.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={selectedPageIds.length === 0 || isSubmitting}
            onClick={handleConnectPages}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <span>
                Kết nối {selectedPageIds.length} Fanpage đã chọn
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
