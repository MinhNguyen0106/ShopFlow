'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/auth.store';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Địa chỉ email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có tối thiểu 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data.email, data.password);
    if (success) {
      router.push('/pages');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Branding */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center gap-2.5 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              ShopFlow
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200">
              SaaS VN
            </span>
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Đăng nhập vào ShopFlow
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Hệ thống tự động hóa Fanpage, quản lý Live Chat và chốt đơn bán hàng thời gian thực.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700"
          >
            Email đăng nhập
          </label>
          <input
            id="email"
            type="email"
            placeholder="chu-shop@gmail.com"
            {...register('email')}
            className={`w-full h-10 px-3.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              errors.email
                ? 'border-red-400 focus:border-red-500'
                : 'border-slate-300 focus:border-blue-600'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-600 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700"
            >
              Mật khẩu
            </label>
            <a
              href="#"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`w-full h-10 pl-3.5 pr-10 rounded-xl border text-sm text-slate-800 placeholder-slate-400 bg-white shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                errors.password
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-slate-300 focus:border-blue-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-600 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="rememberMe"
            className="text-xs text-slate-600 cursor-pointer select-none"
          >
            Ghi nhớ phiên đăng nhập trên thiết bị này
          </label>
        </div>

        {/* Submit Button (Pill Blue) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xác thực...</span>
            </>
          ) : (
            <span>Đăng Nhập Vào Hệ Thống</span>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="pt-2 text-center text-xs text-slate-500">
        Chưa có tài khoản ShopFlow?{' '}
        <Link
          href="/register"
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Đăng ký dùng thử miễn phí
        </Link>
      </div>
    </div>
  );
}
