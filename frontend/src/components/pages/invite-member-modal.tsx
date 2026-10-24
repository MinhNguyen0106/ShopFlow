'use client';

import React, { useState } from 'react';
import { X, Mail, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { usePageMemberStore } from '@/lib/page-member.store';

interface InviteMemberModalProps {
  isOpen: boolean;
  pageId: string;
  pageName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteMemberModal({
  isOpen,
  pageId,
  pageName,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const { inviteMember, isLoading } = usePageMemberStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của nhân viên');
      return;
    }

    try {
      await inviteMember(pageId, {
        email: email.trim().toLowerCase(),
        role,
      });
      setEmail('');
      setRole('staff');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi lời mời';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-semibold text-white">Mời nhân viên vào Fanpage</h3>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">Trang: {pageName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Địa chỉ Email tài khoản ShopFlow
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhanvien@shopflow.vn"
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Role selection radio cards */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Phân quyền vai trò (Role)
            </label>
            <div className="space-y-2.5">
              {/* Staff card */}
              <label
                onClick={() => setRole('staff')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  role === 'staff'
                    ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                    : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="staff"
                  checked={role === 'staff'}
                  onChange={() => setRole('staff')}
                  className="mt-1 sr-only"
                />
                <div
                  className={`p-2 rounded-lg ${
                    role === 'staff'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Nhân viên (Staff)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Bảo vệ PII
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Trực chat, tạo đơn hàng, tự động che số điện thoại khách hàng, không thể sửa kịch bản.
                  </p>
                </div>
              </label>

              {/* Manager card */}
              <label
                onClick={() => setRole('manager')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  role === 'manager'
                    ? 'bg-blue-500/10 border-blue-500/40 shadow-sm'
                    : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={role === 'manager'}
                  onChange={() => setRole('manager')}
                  className="mt-1 sr-only"
                />
                <div
                  className={`p-2 rounded-lg ${
                    role === 'manager'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Quản lý (Manager)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Toàn quyền vận hành
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Quản lý kịch bản tự động, quản lý đơn hàng, xem SĐT khách hàng và mời nhân viên.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Gửi lời mời</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
