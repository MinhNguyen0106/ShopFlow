'use client';

/**
 * ShopFlow - Profile Settings Tab Component (TASK-28)
 * File: frontend/src/components/settings/profile-settings-tab.tsx
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Store,
  Clock,
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settings.store';

export function ProfileSettingsTab() {
  const {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    error,
    successMessage,
    fetchProfile,
    updateProfile,
    clearMessages,
  } = useSettingsStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [brandName, setBrandName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setBrandName(profile.brandName || 'ShopFlow Social Commerce');
      setTimezone(profile.timezone || 'Asia/Ho_Chi_Minh');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearMessages();

    if (!fullName.trim() || fullName.trim().length < 2) {
      setFormError('Họ và tên phải có tối thiểu 2 ký tự');
      return;
    }

    await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim() ? phone.trim() : null,
      brandName: brandName.trim() ? brandName.trim() : null,
      timezone,
    });
  };

  const handleReset = () => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setBrandName(profile.brandName || 'ShopFlow Social Commerce');
      setTimezone(profile.timezone || 'Asia/Ho_Chi_Minh');
      setFormError(null);
      clearMessages();
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'SF').toUpperCase();
  };

  if (isLoadingProfile && !profile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* macOS Window Header Accent */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          <span className="text-xs font-mono text-slate-500 ml-2">profile_owner.config</span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" /> Verified {profile?.role?.toUpperCase() || 'OWNER'}
        </span>
      </div>

      <div className="p-6">
        {/* Profile Avatar Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 mb-6 border-b border-slate-100">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md tracking-wider">
              {getInitials(fullName || profile?.fullName || 'SF')}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:text-primary-600 transition-colors"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">{fullName || profile?.fullName || 'Chủ Cửa Hàng'}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200/60 self-center sm:self-auto">
                {profile?.role === 'owner' ? 'Chủ Shop (Owner)' : profile?.role === 'admin' ? 'Quản Trị Viên' : 'Nhân Viên'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {profile?.email}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              ID Tài Khoản: {profile?.id}
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

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên chủ tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  placeholder="0983 456 892"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tên thương hiệu cửa hàng
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Store className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
                  placeholder="ShopFlow Store"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Múi giờ vận hành
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 transition-all"
              >
                <option value="Asia/Ho_Chi_Minh">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                <option value="Asia/Singapore">(GMT+08:00) Singapore, Kuala Lumpur</option>
                <option value="UTC">(GMT+00:00) Universal Coordinated Time</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              disabled={isUpdatingProfile}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              Khôi phục
            </button>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>Lưu thay đổi</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
