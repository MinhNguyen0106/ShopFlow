'use client';

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  MessageCircle,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';
import { AutomationRule } from '@/types/automation';

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: (rule: AutomationRule, isActive: boolean) => void;
  onEdit: (rule: AutomationRule) => void;
  onDelete: (rule: AutomationRule) => void;
}

export function RuleCard({
  rule,
  onToggle,
  onEdit,
  onDelete,
}: RuleCardProps) {
  const isEnabled = rule.isActive;

  const renderHighlightedTemplate = (text: string) => {
    // Highlight {{customer_name}} and {{page_name}} variables
    const parts = text.split(/({{customer_name}}|{{page_name}})/g);
    return parts.map((part, index) => {
      if (part === '{{customer_name}}' || part === '{{page_name}}') {
        return (
          <span
            key={index}
            className="inline-block px-1.5 py-0.5 mx-0.5 text-xs font-semibold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      data-testid={`rule-card-${rule.id}`}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 p-5 transition-all duration-200 hover:shadow-lg ${
        isEnabled
          ? 'border-slate-200 dark:border-slate-800 shadow-sm'
          : 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-80'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isEnabled
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base truncate">
                {rule.ruleName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEnabled ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ● Đang kích hoạt
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    ○ Đang tạm dừng
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* iOS-style toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            aria-label={`Bật tắt quy tắc ${rule.ruleName}`}
            onClick={() => onToggle(rule, !isEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Trigger Keywords Tags */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <span>Từ khóa kích hoạt ({rule.triggerKeywords.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rule.triggerKeywords.length > 0 ? (
              rule.triggerKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                >
                  #{kw}
                </span>
              ))
            ) : (
              <span className="text-xs italic text-slate-400">
                Không có từ khóa nào
              </span>
            )}
          </div>
        </div>

        {/* Phone Protection Shield Badge */}
        <div className="mb-4">
          {rule.hidePhoneEnabled ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Tự động ẩn SĐT khách hàng (&lt; 3s)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span>Không kích hoạt ẩn SĐT</span>
            </div>
          )}
        </div>

        {/* Response Templates Preview */}
        <div className="space-y-2.5 text-xs mb-4">
          {/* Public Comment Reply */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 mb-1">
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span>Bình luận công khai:</span>
            </div>
            {rule.autoCommentTemplate ? (
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {renderHighlightedTemplate(rule.autoCommentTemplate)}
              </p>
            ) : (
              <p className="text-slate-400 italic">Không tự động bình luận</p>
            )}
          </div>

          {/* Private Messenger Reply */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 mb-1">
              <MessageCircle className="h-3.5 w-3.5 text-indigo-500" />
              <span>Tin nhắn riêng Messenger:</span>
            </div>
            {rule.autoPrivateReplyTemplate ? (
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {renderHighlightedTemplate(rule.autoPrivateReplyTemplate)}
              </p>
            ) : (
              <p className="text-slate-400 italic">Không gửi tin nhắn riêng</p>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          type="button"
          onClick={() => onEdit(rule)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Chỉnh sửa</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(rule)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Xóa</span>
        </button>
      </div>
    </div>
  );
}
