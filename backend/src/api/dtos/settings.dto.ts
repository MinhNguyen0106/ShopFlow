/**
 * ShopFlow - Settings DTOs & Validation Schemas
 * File: backend/src/api/dtos/settings.dto.ts
 *
 * Định nghĩa schemas kiểm thực cho các thao tác Cài đặt Hồ sơ, Đổi mật khẩu và Giám sát API.
 */

import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  fullName: z
    .string({ required_error: 'Họ và tên không được để trống' })
    .trim()
    .min(2, 'Họ và tên tối thiểu 2 ký tự')
    .max(100, 'Họ và tên tối đa 100 ký tự'),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[35789][0-9]{8}$/, 'Số điện thoại không đúng định dạng')
    .optional()
    .nullable(),
  brandName: z
    .string()
    .trim()
    .max(120, 'Tên thương hiệu không vượt quá 120 ký tự')
    .optional()
    .nullable(),
  timezone: z
    .string()
    .trim()
    .default('Asia/Ho_Chi_Minh')
    .optional(),
});

export const UpdateProfileDtoSchema = z.preprocess((input) => {
  if (input && typeof input === 'object') {
    const raw = input as Record<string, unknown>;
    return {
      ...raw,
      fullName: raw.fullName ?? raw.full_name,
      brandName: raw.brandName ?? raw.brand_name,
    };
  }
  return input;
}, UpdateProfileSchema);

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Mật khẩu hiện tại không được để trống' })
    .min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z
    .string({ required_error: 'Mật khẩu mới không được để trống' })
    .min(8, 'Mật khẩu mới phải có tối thiểu 8 ký tự')
    .max(128, 'Mật khẩu mới không được vượt quá 128 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{}|;:,.<>/])/,
      'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
    ),
});

export const ChangePasswordDtoSchema = z.preprocess((input) => {
  if (input && typeof input === 'object') {
    const raw = input as Record<string, unknown>;
    return {
      ...raw,
      currentPassword: raw.currentPassword ?? raw.current_password,
      newPassword: raw.newPassword ?? raw.new_password,
    };
  }
  return input;
}, ChangePasswordSchema);

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
