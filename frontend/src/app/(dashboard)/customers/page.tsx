'use client';

/**
 * ShopFlow - Customers & Leads Management Page
 * Route: /customers
 * File: frontend/src/app/(dashboard)/customers/page.tsx
 *
 * Màn hình Quản Lý Khách Hàng & Leads Tập Trung (TASK-27).
 * Chuẩn macOS Clean Utility Bento Grid, tính toán LTV, phân loại Leads và bảo mật PII.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  RefreshCw,
  Layers,
  AlertCircle,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { usePageStore } from '@/lib/page.store';
import { useCustomerStore } from '@/lib/customer.store';
import { CustomerMetrics } from '@/components/customers/CustomerMetrics';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerDetailDrawer } from '@/components/customers/CustomerDetailDrawer';
import { Customer } from '@/types/customer';

export default function CustomersPage() {
  const { pages, selectedPage, fetchPages, selectPage } = usePageStore();
  const {
    customers,
    selectedCustomer,
    customerOrders,
    metrics,
    filters,
    pagination,
    isLoading,
    isLoadingOrders,
    isUpdatingTag,
    error,
    fetchCustomers,
    fetchMetrics,
    selectCustomer,
    setSearchQuery,
    setTagsFilter,
    setPage,
    addTag,
    removeTag,
    updateCustomerNotes,
    clearError,
  } = useCustomerStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Initial Page Fetch
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // 2. Default to first active page if not selected
  useEffect(() => {
    if (!selectedPage && pages.length > 0) {
      const active = pages.find((p) => p.isActive) || pages[0];
      selectPage(active);
    }
  }, [selectedPage, pages, selectPage]);

  // 3. Fetch Customers & Metrics when selectedPage or filters change
  const activePageId = selectedPage?.id;

  const loadData = useCallback(() => {
    if (activePageId) {
      fetchCustomers(activePageId);
      fetchMetrics(activePageId);
    }
  }, [activePageId, fetchCustomers, fetchMetrics]);

  useEffect(() => {
    loadData();
  }, [loadData, filters.search, filters.tags, filters.page, filters.sortBy, filters.sortOrder]);

  const handleSelectCustomer = (customer: Customer) => {
    selectCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    selectCustomer(null);
  };

  const handleToggleTagFilter = (tag: string) => {
    const currentTags = filters.tags;
    if (currentTags.includes(tag)) {
      setTagsFilter(currentTags.filter((t) => t !== tag));
    } else {
      setTagsFilter([...currentTags, tag]);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 w-full select-none" data-testid="customers-page">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Quản lý Khách hàng & Leads
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60">
              macOS Bento Grid
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Danh bạ khách hàng tập trung, theo dõi tổng chi tiêu (LTV), gắn thẻ phân loại Leads và bảo vệ PII.
          </p>
        </div>

        {/* Fanpage Switcher & Action buttons */}
        <div className="flex items-center gap-3">
          {pages.length > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
              <Layers className="w-4 h-4 text-slate-400" />
              <select
                aria-label="Chọn Fanpage quản lý"
                value={selectedPage?.id || ''}
                onChange={(e) => {
                  const target = pages.find((p) => p.id === e.target.value);
                  if (target) selectPage(target);
                }}
                className="text-xs font-semibold bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.pageName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm transition-all disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-between text-xs text-red-700 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="font-semibold underline ml-3"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 4 Cards Bento Grid Metrics */}
      <CustomerMetrics metrics={metrics} isLoading={isLoading} />

      {/* Main Customers Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        searchQuery={filters.search}
        onSearchChange={setSearchQuery}
        selectedTags={filters.tags}
        onToggleTag={handleToggleTagFilter}
        onSelectCustomer={handleSelectCustomer}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Customer Detail Drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        orders={customerOrders}
        isLoadingOrders={isLoadingOrders}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onUpdateNotes={updateCustomerNotes}
        isUpdatingTag={isUpdatingTag}
      />
    </div>
  );
}
