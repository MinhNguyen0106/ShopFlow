'use client';

/**
 * ShopFlow - Automation Rules Management Page
 * Route: /automation
 * File: frontend/src/app/(dashboard)/automation/page.tsx
 *
 * Màn hình Cấu hình Kịch bản Tự động & Ẩn SĐT (TASK-18).
 * Phong cách thiết kế macOS Clean Utility, Bento grid cards, Tag Input và Optimistic UI.
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  ShieldCheck,
  Zap,
  Filter,
  RefreshCw,
  Layers,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { usePageStore } from '@/lib/page.store';
import { useAutomationStore } from '@/lib/automation.store';
import { RuleCard } from '@/components/automation/rule-card';
import { RuleModal } from '@/components/automation/rule-modal';
import { DeleteRuleDialog } from '@/components/automation/delete-rule-dialog';
import { AutomationRule, CreateAutomationRuleInput } from '@/types/automation';

export default function AutomationPage() {
  const { pages, selectedPage, fetchPages, selectPage } = usePageStore();
  const {
    rules,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    fetchRules,
    createRule,
    updateRule,
    toggleRuleActive,
    deleteRule,
    clearError,
  } = useAutomationStore();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<AutomationRule | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<AutomationRule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load pages initially
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // If no selectedPage and pages exist, select the first page by default
  useEffect(() => {
    if (!selectedPage && pages.length > 0) {
      selectPage(pages[0]);
    }
  }, [selectedPage, pages, selectPage]);

  // Load rules whenever selectedPage changes
  const activePageId = selectedPage?.pageId || selectedPage?.id || '';
  useEffect(() => {
    if (activePageId) {
      fetchRules(activePageId);
    }
  }, [activePageId, fetchRules]);

  // Filter rules by search query and active tab
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      // Tab filter
      if (activeTab === 'active' && !rule.isActive) return false;
      if (activeTab === 'inactive' && rule.isActive) return false;

      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = rule.ruleName.toLowerCase().includes(q);
      const matchKeywords = rule.triggerKeywords.some((k) =>
        k.toLowerCase().includes(q)
      );
      const matchComment = rule.autoCommentTemplate?.toLowerCase().includes(q) || false;
      const matchPrivate = rule.autoPrivateReplyTemplate?.toLowerCase().includes(q) || false;

      return matchName || matchKeywords || matchComment || matchPrivate;
    });
  }, [rules, activeTab, searchQuery]);

  // Calculated Metrics
  const activeRulesCount = useMemo(
    () => rules.filter((r) => r.isActive).length,
    [rules]
  );
  const phoneProtectedRulesCount = useMemo(
    () => rules.filter((r) => r.hidePhoneEnabled).length,
    [rules]
  );
  const messengerRulesCount = useMemo(
    () => rules.filter((r) => Boolean(r.autoPrivateReplyTemplate)).length,
    [rules]
  );

  const handleOpenCreateModal = () => {
    setRuleToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: AutomationRule) => {
    setRuleToEdit(rule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRuleToEdit(null);
  };

  const handleModalSubmit = async (data: CreateAutomationRuleInput): Promise<boolean> => {
    if (!activePageId) return false;

    if (ruleToEdit) {
      const updated = await updateRule(activePageId, ruleToEdit.id, data);
      return Boolean(updated);
    } else {
      const created = await createRule(activePageId, data);
      return Boolean(created);
    }
  };

  const handleToggleActive = async (rule: AutomationRule, newStatus: boolean) => {
    if (!activePageId) return;
    await toggleRuleActive(activePageId, rule.id, newStatus);
  };

  const handleDeleteConfirm = async () => {
    if (!activePageId || !ruleToDelete) return;
    setIsDeleting(true);
    await deleteRule(activePageId, ruleToDelete.id);
    setIsDeleting(false);
    setRuleToDelete(null);
  };

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kịch Bản Tự Động & Ẩn SĐT
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Zap className="h-3 w-3" />
              Meta Engine SLA &lt; 3s
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tự động phản hồi bình luận, gửi tin nhắn riêng Messenger theo từ khóa và quét ẩn số điện thoại khách hàng tức thì.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => activePageId && fetchRules(activePageId)}
            disabled={isLoading || !activePageId}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            disabled={!activePageId}
            data-testid="create-rule-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>+ Tạo Kịch Bản Mới</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-xs font-semibold hover:underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Overview 4 Bento Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng kịch bản</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {rules.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Thiết lập trên Fanpage</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Đang kích hoạt</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeRulesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sẵn sàng phản hồi</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ẩn SĐT tự động</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {phoneProtectedRulesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bảo vệ chống cướp đơn</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Phản hồi Inbox</span>
            <Radio className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {messengerRulesCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Meta Private Reply</p>
        </div>
      </div>

      {/* Toolbar: Fanpage Selector & Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left: Fanpage Dropdown & Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fanpage Selector */}
          <div className="relative min-w-[200px]">
            <select
              aria-label="Chọn Fanpage"
              value={selectedPage?.id || ''}
              onChange={(e) => {
                const found = pages.find((p) => p.id === e.target.value) || null;
                selectPage(found);
              }}
              className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {pages.length === 0 ? (
                <option value="">Chưa kết nối Fanpage nào</option>
              ) : (
                pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    📄 {p.pageName}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Segmented Filter Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Tất cả ({rules.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Đang bật ({activeRulesCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'inactive'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Đã tắt ({rules.length - activeRulesCount})
            </button>
          </div>
        </div>

        {/* Right: Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {!activePageId ? (
        /* Empty Page Warning */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 mb-4">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Chưa chọn Fanpage
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Vui lòng kết nối và chọn một Fanpage để quản lý các kịch bản tự động hóa và cài đặt ẩn số điện thoại.
          </p>
        </div>
      ) : filteredRules.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {searchQuery
              ? 'Không tìm thấy kịch bản phù hợp'
              : 'Chưa có kịch bản tự động hóa nào'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
            {searchQuery
              ? `Không có quy tắc nào khớp với từ khóa tìm kiếm "${searchQuery}". Hãy thử cụm từ khác.`
              : 'Hãy tạo kịch bản đầu tiên để tự động trả lời bình luận hỏi giá, tư vấn size và bảo vệ thông tin khách hàng tức thì.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo kịch bản đầu tiên</span>
            </button>
          )}
        </div>
      ) : (
        /* Bento Grid of Rule Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggleActive}
              onEdit={handleOpenEditModal}
              onDelete={(r) => setRuleToDelete(r)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      <RuleModal
        isOpen={isModalOpen}
        ruleToEdit={ruleToEdit}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />

      {/* Delete Confirmation Safe Dialog */}
      <DeleteRuleDialog
        isOpen={Boolean(ruleToDelete)}
        rule={ruleToDelete}
        onClose={() => setRuleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
