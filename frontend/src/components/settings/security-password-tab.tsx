'use client';

/**
 * ShopFlow - Security & Password Settings Tab Component (TASK-28)
 * File: frontend/src/components/settings/security-password-tab.tsx
 */

import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Laptop,
  Smartphone,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settings.store';

export function SecurityPasswordTab() {
  const { isChangingPassword, error, successMessage, changePassword, clearMessages } =
    useSettingsStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Tính toán độ mạnh mật khẩu (Password Strength)
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[@$!%*?&#^()_+\-=[\]{}|;:,.<>/]/.test(newPassword);

  const passedCriteriaCount = [
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  let strengthLabel = 'Chưa nhập';
  let strengthColor = 'bg-slate-200';
  let strengthTextColor = 'text-slate-400';

  if (newPassword.length > 0) {
    if (passedCriteriaCount <= 2) {
      strengthLabel = 'Yếu';
      strengthColor = 'bg-rose-500';
      strengthTextColor = 'text-rose-600';
    } else if (passedCriteriaCount === 3 || passedCriteriaCount === 4) {
      strengthLabel = 'Trung bình';
      strengthColor = 'bg-amber-500';
      strengthTextColor = 'text-amber-600';
    } else if (passedCriteriaCount === 5) {
      strengthLabel = 'Rất mạnh (Khuyên dùng)';
      strengthColor = 'bg-emerald-500';
      strengthTextColor = 'text-emerald-600';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearMessages();

    if (!currentPassword) {
      setFormError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (passedCriteriaCount < 5) {
      setFormError('Mật khẩu mới chưa đáp ứng đầy đủ tiêu chuẩn bảo mật an toàn');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Xác nhận mật khẩu mới không trùng khớp');
      return;
    }

    const result = await changePassword({
      currentPassword,
      newPassword,
    });

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Form Đổi Mật Khẩu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <span className="text-xs font-mono text-slate-500 ml-2">security_auth.config</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200/80 rounded-full text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Bcrypt 12 Rounds
          </span>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 pb-5 mb-5 border-b border-slate-100">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Thay Đổi Mật Khẩu Đăng Nhập</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Đảm bảo mật khẩu của bạn có độ dài tối thiểu 8 ký tự, kết hợp chữ in hoa, chữ thường, số và ký tự đặc biệt.
              </p>
            </div>
          </div>

          {/* Form Notifications */}
          {(error || formError) && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error || formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  placeholder="Nhập mật khẩu đang sử dụng..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  placeholder="Nhập mật khẩu mới an toàn..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Độ mạnh mật khẩu:</span>
                  <span className={`font-semibold ${strengthTextColor}`}>{strengthLabel}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 1 ? strengthColor : 'bg-transparent'}`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 2 ? strengthColor : 'bg-transparent'}`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 3 ? strengthColor : 'bg-transparent'}`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 4 ? strengthColor : 'bg-transparent'}`} style={{ width: '20%' }} />
                  <div className={`h-full rounded-full transition-all ${passedCriteriaCount >= 5 ? strengthColor : 'bg-transparent'}`} style={{ width: '20%' }} />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />} Tối thiểu 8 ký tự
                  </span>
                  <span className="flex items-center gap-1.5">
                    {hasUpperCase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />} Có chữ in hoa (A-Z)
                  </span>
                  <span className="flex items-center gap-1.5">
                    {hasLowerCase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />} Có chữ thường (a-z)
                  </span>
                  <span className="flex items-center gap-1.5">
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />} Có số (0-9)
                  </span>
                  <span className="flex items-center gap-1.5 col-span-2">
                    {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />} Có ký tự đặc biệt (@, $, !, %, *, ?, &, #)
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                placeholder="Nhập lại mật khẩu mới..."
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>Cập nhật mật khẩu</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Card 2: Quản lý Phiên Đăng Nhập & Thiết Bị */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Thiết Bị &amp; Phiên Đăng Nhập</h3>
            <p className="text-sm text-slate-500">Các phiên làm việc đang duy trì truy cập vào tài khoản ShopFlow của bạn.</p>
          </div>
          <button
            type="button"
            className="px-3.5 py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            onClick={() => alert('Đã đăng xuất khỏi tất cả các thiết bị phụ khác thành công!')}
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất phiên khác
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100/70 text-emerald-700 rounded-lg">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  Trình duyệt hiện tại (Google Chrome / macOS)
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Việt Nam • Đang hoạt động ngay bây giờ</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Thiết bị chính
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">ShopFlow Mobile App (iOS)</p>
                <p className="text-xs text-slate-500 mt-0.5">TP. Hồ Chí Minh • Hoạt động 3 giờ trước</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono">Phiên lưu trữ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
