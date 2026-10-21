'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  MessageCircle,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { AutomationRule, CreateAutomationRuleInput } from '@/types/automation';

interface RuleModalProps {
  isOpen: boolean;
  ruleToEdit?: AutomationRule | null;
  onClose: () => void;
  onSubmit: (data: CreateAutomationRuleInput) => Promise<boolean>;
}

export function RuleModal({
  isOpen,
  ruleToEdit,
  onClose,
  onSubmit,
}: RuleModalProps) {
  const isEditing = Boolean(ruleToEdit);

  const [ruleName, setRuleName] = useState('');
  const [hidePhoneEnabled, setHidePhoneEnabled] = useState(true);
  const [triggerKeywords, setTriggerKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [autoCommentTemplate, setAutoCommentTemplate] = useState('');
  const [autoPrivateReplyTemplate, setAutoPrivateReplyTemplate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Focus tracking for inserting variables
  const [activeTemplateField, setActiveTemplateField] = useState<'comment' | 'private'>('comment');

  useEffect(() => {
    if (isOpen) {
      if (ruleToEdit) {
        setRuleName(ruleToEdit.ruleName);
        setHidePhoneEnabled(ruleToEdit.hidePhoneEnabled);
        setTriggerKeywords([...ruleToEdit.triggerKeywords]);
        setAutoCommentTemplate(ruleToEdit.autoCommentTemplate || '');
        setAutoPrivateReplyTemplate(ruleToEdit.autoPrivateReplyTemplate || '');
        setIsActive(ruleToEdit.isActive);
      } else {
        setRuleName('');
        setHidePhoneEnabled(true);
        setTriggerKeywords(['giá', 'tư vấn', 'inbox']);
        setAutoCommentTemplate('');
        setAutoPrivateReplyTemplate('');
        setIsActive(true);
      }
      setKeywordInput('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, ruleToEdit]);

  if (!isOpen) return null;

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;

    // Split by comma if user pasted comma-separated string
    const newItems = trimmed
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0 && !triggerKeywords.includes(k));

    if (newItems.length > 0) {
      setTriggerKeywords((prev) => [...prev, ...newItems]);
      setKeywordInput('');
      setError(null);
    }
  };

  const handleKeyDownKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setTriggerKeywords((prev) => prev.filter((k) => k !== keywordToRemove));
  };

  const handleInsertVariable = (variable: '{{customer_name}}' | '{{page_name}}') => {
    if (activeTemplateField === 'comment') {
      setAutoCommentTemplate((prev) => `${prev}${prev ? ' ' : ''}${variable}`);
    } else {
      setAutoPrivateReplyTemplate((prev) => `${prev}${prev ? ' ' : ''}${variable}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = ruleName.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên quy tắc');
      return;
    }

    if (triggerKeywords.length === 0) {
      setError('Quy tắc cần có ít nhất 1 từ khóa kích hoạt');
      return;
    }

    setIsSubmitting(true);
    const payload: CreateAutomationRuleInput = {
      rule_name: trimmedName,
      hide_phone_enabled: hidePhoneEnabled,
      trigger_keywords: triggerKeywords,
      auto_comment_template: autoCommentTemplate.trim() || null,
      auto_private_reply_template: autoPrivateReplyTemplate.trim() || null,
      is_active: isActive,
    };

    const success = await onSubmit(payload);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {isEditing ? 'Chỉnh sửa kịch bản tự động' : 'Tạo mới kịch bản tự động'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phản hồi bình luận, gửi tin nhắn và tự động ẩn số điện thoại khách hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Rule Name */}
          <div>
            <label htmlFor="ruleName" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên quy tắc / Kịch bản <span className="text-rose-500">*</span>
            </label>
            <input
              id="ruleName"
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Ví dụ: Tự động báo giá son dưỡng, Tư vấn size áo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </div>

          {/* Trigger Keywords Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Từ khóa kích hoạt <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeyDownKeyword}
                  placeholder="Nhập từ khóa và bấm Enter (ví dụ: giá, ship, tư vấn)"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-1" />
                Thêm
              </button>
            </div>

            {/* Keyword Chips List */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
              {triggerKeywords.length > 0 ? (
                triggerKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800"
                  >
                    #{keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      aria-label={`Xóa từ khóa ${keyword}`}
                      className="hover:text-rose-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic py-1">
                  Chưa có từ khóa nào. Hãy thêm ít nhất 1 từ khóa kích hoạt.
                </span>
              )}
            </div>
          </div>

          {/* Phone Shield Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Tự động ẩn bình luận chứa số điện thoại (&lt; 3 giây)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bảo vệ thông tin khách hàng và phòng chống cướp đơn tức thì
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={hidePhoneEnabled}
              aria-label="Tự động ẩn số điện thoại"
              onClick={() => setHidePhoneEnabled(!hidePhoneEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                hidePhoneEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  hidePhoneEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Template Variables Helper Toolbar */}
          <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 p-3 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                Chèn nhanh biến động vào mẫu phản hồi:
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                Đang chèn vào: {activeTemplateField === 'comment' ? 'Bình luận' : 'Tin nhắn riêng'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInsertVariable('{{customer_name}}')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                + Tên khách hàng (&#123;&#123;customer_name&#125;&#125;)
              </button>
              <button
                type="button"
                onClick={() => handleInsertVariable('{{page_name}}')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                + Tên Fanpage (&#123;&#123;page_name&#125;&#125;)
              </button>
            </div>
          </div>

          {/* Auto Public Comment Template */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="autoCommentTemplate" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                <span>Mẫu bình luận tự động công khai (Tùy chọn)</span>
              </label>
            </div>
            <textarea
              id="autoCommentTemplate"
              rows={2}
              value={autoCommentTemplate}
              onFocus={() => setActiveTemplateField('comment')}
              onChange={(e) => setAutoCommentTemplate(e.target.value)}
              placeholder="Dạ shop đã gửi thông tin qua tin nhắn cho bạn {{customer_name}} rồi ạ!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Auto Private Reply Template */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="autoPrivateReplyTemplate" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MessageCircle className="h-3.5 w-3.5 text-indigo-500" />
                <span>Mẫu tin nhắn riêng Messenger (Private Reply - Tùy chọn)</span>
              </label>
            </div>
            <textarea
              id="autoPrivateReplyTemplate"
              rows={2}
              value={autoPrivateReplyTemplate}
              onFocus={() => setActiveTemplateField('private')}
              onChange={(e) => setAutoPrivateReplyTemplate(e.target.value)}
              placeholder="Chào {{customer_name}}, sản phẩm bên em hiện đang có ưu đãi giảm 20%..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Is Active Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Kích hoạt kịch bản ngay sau khi lưu
              </p>
              <p className="text-[11px] text-slate-500">
                Cho phép hệ thống tự động trả lời ngay khi có khách hàng tương tác
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label="Kích hoạt kịch bản"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting
                ? 'Đang lưu...'
                : isEditing
                  ? 'Cập nhật kịch bản'
                  : 'Lưu kịch bản mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
