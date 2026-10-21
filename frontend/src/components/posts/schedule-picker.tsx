'use client';

/**
 * ShopFlow - Schedule Picker Component
 * File: frontend/src/components/posts/schedule-picker.tsx
 *
 * Cho phép người dùng chuyển đổi giữa Đăng ngay hoặc Hẹn giờ xuất bản,
 * tích hợp gợi ý khung giờ vàng tương tác cao và kiểm tra tính hợp lệ (>= 10 phút).
 */

import React, { useMemo } from 'react';
import {
  Clock,
  Send,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export type PublishMode = 'now' | 'schedule';

interface SchedulePickerProps {
  publishMode: PublishMode;
  scheduledTime: string; // ISO string hoặc YYYY-MM-DDTHH:mm
  onPublishModeChange: (mode: PublishMode) => void;
  onScheduledTimeChange: (timeIso: string, isValid: boolean) => void;
  disabled?: boolean;
}

export const SchedulePicker: React.FC<SchedulePickerProps> = ({
  publishMode,
  scheduledTime,
  onPublishModeChange,
  onScheduledTimeChange,
  disabled = false,
}) => {
  // Chuyển ISO sang định dạng YYYY-MM-DDTHH:mm cho input type="datetime-local"
  const localDateTimeValue = useMemo(() => {
    if (!scheduledTime) return '';
    try {
      const d = new Date(scheduledTime);
      if (isNaN(d.getTime())) return '';
      // Lấy theo giờ địa phương của máy khách
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  }, [scheduledTime]);

  // Kiểm tra thời gian có cách hiện tại ít nhất 10 phút không
  const validation = useMemo(() => {
    if (publishMode === 'now') {
      return { isValid: true, message: null };
    }
    if (!scheduledTime) {
      return { isValid: false, message: 'Vui lòng chọn ngày và giờ đặt lịch.' };
    }
    const d = new Date(scheduledTime);
    if (isNaN(d.getTime())) {
      return { isValid: false, message: 'Định dạng thời gian không hợp lệ.' };
    }
    const diffMs = d.getTime() - Date.now();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 10) {
      return {
        isValid: false,
        message: 'Thời gian đặt lịch phải cách thời điểm hiện tại ít nhất 10 phút.',
      };
    }
    return {
      isValid: true,
      message: `Hẹn giờ xuất bản sau ${
        diffMinutes >= 60
          ? `${Math.floor(diffMinutes / 60)} giờ ${diffMinutes % 60} phút`
          : `${diffMinutes} phút`
      }.`,
    };
  }, [publishMode, scheduledTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) {
      onScheduledTimeChange('', false);
      return;
    }
    const selectedDate = new Date(val);
    const isoString = selectedDate.toISOString();
    const diffMs = selectedDate.getTime() - Date.now();
    const isValid = diffMs >= 10 * 60 * 1000;
    onScheduledTimeChange(isoString, isValid);
  };

  // Tạo các mốc khung giờ vàng nhanh
  const goldenHourPresets = useMemo(() => {
    const now = new Date();
    const presets: Array<{ label: string; date: Date }> = [];

    // Mốc trưa nay 11:30
    const noonToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30, 0);
    if (noonToday.getTime() - now.getTime() >= 10 * 60 * 1000) {
      presets.push({ label: 'Trưa nay 11:30 🌟', date: noonToday });
    }

    // Mốc tối nay 20:00
    const eveningToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
    if (eveningToday.getTime() - now.getTime() >= 10 * 60 * 1000) {
      presets.push({ label: 'Tối nay 20:00 🌟', date: eveningToday });
    }

    // Mốc trưa mai 11:30
    const noonTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30, 0);
    presets.push({ label: 'Trưa mai 11:30', date: noonTomorrow });

    // Mốc tối mai 20:00
    const eveningTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 20, 0, 0);
    presets.push({ label: 'Tối mai 20:00', date: eveningTomorrow });

    return presets.slice(0, 3);
  }, []);

  const handlePresetClick = (date: Date) => {
    onPublishModeChange('schedule');
    onScheduledTimeChange(date.toISOString(), true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Thời gian xuất bản
        </label>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3 text-primary" />
          Múi giờ: GMT+7 (Việt Nam)
        </span>
      </div>

      {/* Mode Selector (Đăng ngay vs Lên lịch) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPublishModeChange('now')}
          disabled={disabled}
          data-testid="publish-mode-now-btn"
          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
            publishMode === 'now'
              ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
              : 'border-border/60 bg-muted/20 hover:bg-muted/30 text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              publishMode === 'now'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Send className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight">Đăng ngay</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Xuất bản lập tức lên Fanpage</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onPublishModeChange('schedule');
            // Nếu chưa có thời gian, mặc định là 15 phút sau
            if (!scheduledTime) {
              const defaultTime = new Date(Date.now() + 15 * 60 * 1000);
              onScheduledTimeChange(defaultTime.toISOString(), true);
            }
          }}
          disabled={disabled}
          data-testid="publish-mode-schedule-btn"
          className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
            publishMode === 'schedule'
              ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
              : 'border-border/60 bg-muted/20 hover:bg-muted/30 text-muted-foreground'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              publishMode === 'schedule'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight">Lên lịch hẹn giờ</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tự động xuất bản theo giờ định sẵn</p>
          </div>
        </button>
      </div>

      {/* Schedule Picker Input and Golden Hour Presets */}
      {publishMode === 'schedule' && (
        <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Chọn ngày và giờ:
            </label>
            <input
              type="datetime-local"
              value={localDateTimeValue}
              onChange={handleInputChange}
              disabled={disabled}
              data-testid="schedule-datetime-input"
              className="w-full px-3.5 py-2 rounded-xl border border-border/60 bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Validation Status Notice */}
          {validation.message && (
            <div
              data-testid="schedule-validation-notice"
              className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border ${
                validation.isValid
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {validation.isValid ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{validation.message}</span>
            </div>
          )}

          {/* Golden Hour Presets Buttons */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Gợi ý khung giờ vàng tương tác cao:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {goldenHourPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(preset.date)}
                  disabled={disabled}
                  data-testid={`golden-hour-preset-${idx}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
