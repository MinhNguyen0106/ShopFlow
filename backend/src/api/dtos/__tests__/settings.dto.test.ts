import { describe, it, expect } from 'vitest';
import { UpdateProfileDtoSchema, ChangePasswordDtoSchema } from '../settings.dto.js';

describe('Settings DTOs Validation', () => {
  describe('UpdateProfileDtoSchema', () => {
    it('thẩm định thành công với fullName hợp lệ (camelCase)', () => {
      const parsed = UpdateProfileDtoSchema.parse({
        fullName: 'Nguyễn Văn A',
        phone: '0987654321',
        brandName: 'Shop Thời Trang Mùa Hè',
      });
      expect(parsed.fullName).toBe('Nguyễn Văn A');
      expect(parsed.phone).toBe('0987654321');
    });

    it('thẩm định thành công với full_name (snake_case fallback)', () => {
      const parsed = UpdateProfileDtoSchema.parse({
        full_name: 'Trần Thị B',
      });
      expect(parsed.fullName).toBe('Trần Thị B');
    });

    it('từ chối khi fullName quá ngắn (< 2 ký tự)', () => {
      expect(() => UpdateProfileDtoSchema.parse({ fullName: 'A' })).toThrow();
    });

    it('từ chối số điện thoại sai định dạng', () => {
      expect(() =>
        UpdateProfileDtoSchema.parse({
          fullName: 'Nguyễn Văn A',
          phone: '123456',
        })
      ).toThrow();
    });
  });

  describe('ChangePasswordDtoSchema', () => {
    it('thẩm định thành công mật khẩu đủ điều kiện', () => {
      const parsed = ChangePasswordDtoSchema.parse({
        currentPassword: 'oldPassword123!',
        newPassword: 'StrongPassword2026@',
      });
      expect(parsed.currentPassword).toBe('oldPassword123!');
      expect(parsed.newPassword).toBe('StrongPassword2026@');
    });

    it('hỗ trợ snake_case current_password và new_password', () => {
      const parsed = ChangePasswordDtoSchema.parse({
        current_password: 'oldPassword123!',
        new_password: 'StrongPassword2026@',
      });
      expect(parsed.currentPassword).toBe('oldPassword123!');
      expect(parsed.newPassword).toBe('StrongPassword2026@');
    });

    it('từ chối khi mật khẩu mới thiếu ký tự đặc biệt', () => {
      expect(() =>
        ChangePasswordDtoSchema.parse({
          currentPassword: 'oldPassword123!',
          newPassword: 'NoSpecialChar123',
        })
      ).toThrow();
    });

    it('từ chối khi mật khẩu mới ngắn hơn 8 ký tự', () => {
      expect(() =>
        ChangePasswordDtoSchema.parse({
          currentPassword: 'oldPassword123!',
          newPassword: 'Aa1@',
        })
      ).toThrow();
    });
  });
});
