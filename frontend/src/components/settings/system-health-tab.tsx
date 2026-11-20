'use client';

/**
 * ShopFlow - System Health & Observability Tab (TASK-30)
 * File: frontend/src/components/settings/system-health-tab.tsx
 *
 * Hiển thị chỉ số sức khỏe hạ tầng thời gian thực: DB Pool, Redis, BullMQ và Test Telegram Alert.
 */

import React, { useEffect, useState } from 'react';
import {
  Server,
  Database,
  Layers,
  Bell,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
} from 'lucide-react';
import { useSettingsStore } from '@/lib/settings.store';

export function SystemHealthTab() {
  const {
    healthStats,
    fetchHealthStats,
    isLoadingHealthStats,
    sendTestAlert,
    isSendingTestAlert,
  } = useSettingsStore();

  const [alertFeedback, setAlertFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchHealthStats();
  }, [fetchHealthStats]);

  const handleSendTestAlert = async () => {
    setAlertFeedback(null);
    const result = await sendTestAlert();
    setAlertFeedback({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary-600" />
            Giám Sát Sức Khỏe Hạ Tầng &amp; Telemetry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi trạng thái tài nguyên máy chủ, kết nối cơ sở dữ liệu PostgreSQL, hàng đợi BullMQ và kênh cảnh báo Telegram.
          </p>
        </div>

        <button
          onClick={() => fetchHealthStats()}
          disabled={isLoadingHealthStats}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealthStats ? 'animate-spin' : ''}`} />
          <span>Làm mới chỉ số</span>
        </button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Runtime & Memory */}
        <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-primary-600" />
                Máy Chủ Node.js
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {healthStats?.nodeEnv || 'Production'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Heap Memory:</span>
                  <span className="font-semibold font-mono">
                    {healthStats?.memory.heapUsedMb || 0} / {healthStats?.memory.heapTotalMb || 0} MB
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-600 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((healthStats?.memory.heapUsedMb || 0) /
                          Math.max(1, healthStats?.memory.heapTotalMb || 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>RSS Memory:</span>
                <span className="font-semibold font-mono">{healthStats?.memory.rssMb || 0} MB</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Thời gian chạy: <b>{formatUptime(healthStats?.uptimeSeconds || 0)}</b></span>
          </div>
        </div>

        {/* Card 2: Database PostgreSQL Pool */}
        <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                PostgreSQL Pool
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Kết nối tốt
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-2">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {healthStats?.database.totalConnections ?? 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tổng Pool</div>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-200/60">
                <div className="text-lg font-bold text-blue-700 font-mono">
                  {healthStats?.database.activeConnections ?? 0}
                </div>
                <div className="text-[10px] text-blue-600 mt-0.5">Đang bận</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-700 font-mono">
                  {healthStats?.database.idleConnections ?? 0}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Nhàn rỗi</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Truy vấn đang xếp hàng chờ: <b>{healthStats?.database.waitingRequests ?? 0}</b>
          </div>
        </div>

        {/* Card 3: BullMQ Queues */}
        <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Hàng Đợi BullMQ
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Redis 7
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Webhook Processing:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {healthStats?.queues.webhookProcessing.waiting || 0} jobs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Quét &amp; Ẩn SĐT &lt;3s:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {healthStats?.queues.phoneMasking.waiting || 0} jobs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Đặt lịch xuất bản bài:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {healthStats?.queues.scheduledPost.waiting || 0} jobs
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Jobs thất bại (DLQ):</span>
            <span
              className={`font-mono font-bold ${
                (healthStats?.queues.phoneMasking.failed || 0) > 0
                  ? 'text-rose-600'
                  : 'text-emerald-600'
              }`}
            >
              {(healthStats?.queues.phoneMasking.failed || 0) +
                (healthStats?.queues.webhookProcessing.failed || 0)}{' '}
              lỗi
            </span>
          </div>
        </div>

        {/* Card 4: Telegram Alerting */}
        <div className="p-4 rounded-2xl bg-white border border-slate-300/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                Cảnh Báo Telegram
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  healthStats?.alerting.enabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {healthStats?.alerting.enabled ? 'Đang Bật' : 'Tắt'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Tự động cảnh báo sự cố 5xx, lỗi Meta Rate Limit 613 và lỗi hàng đợi tức thì qua Telegram.
            </p>

            <button
              onClick={handleSendTestAlert}
              disabled={isSendingTestAlert}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTestAlert ? 'animate-pulse' : ''}`} />
              <span>{isSendingTestAlert ? 'Đang gửi test...' : 'Gửi Test Alert'}</span>
            </button>
          </div>

          {alertFeedback && (
            <div
              className={`mt-3 p-2 rounded-xl text-[11px] flex items-center gap-1.5 ${
                alertFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {alertFeedback.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              )}
              <span className="truncate">{alertFeedback.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
