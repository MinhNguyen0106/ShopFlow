/**
 * ShopFlow - Customers & CRM UI Component & Page Integration Tests
 * File: frontend/src/app/(dashboard)/customers/__tests__/customers-page.test.tsx
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomersPage from '../page';
import { CustomerMetrics } from '@/components/customers/CustomerMetrics';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerDetailDrawer } from '@/components/customers/CustomerDetailDrawer';
import { useCustomerStore } from '@/lib/customer.store';
import { usePageStore } from '@/lib/page.store';
import { Customer } from '@/types/customer';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    patch: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true, data: {} } }),
  },
}));

describe('Customers & CRM UI Components (TASK-27)', () => {
  const sampleCustomer: Customer = {
    id: 'cust-101',
    pageId: 'page-1',
    customerFbId: 'fb-user-123',
    customerName: 'Trần Thị Mai',
    phoneNumber: '0981234567',
    address: '123 Cầu Giấy, Hà Nội',
    tags: ['Co_SDT', 'Khach_VIP'],
    notes: 'Khách hay hỏi vào khung giờ vàng',
    lifetimeValue: 3500000,
    totalOrders: 5,
    lastOrderAt: '2026-10-25T10:00:00.000Z',
    lastInteractionAt: '2026-10-25T10:00:00.000Z',
    createdAt: '2026-10-01T10:00:00.000Z',
    aov: 700000,
  };

  const sampleMetrics = {
    totalCustomers: 150,
    leadsWithPhone: 120,
    vipCustomers: 20,
    totalLifetimeValue: 75000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    usePageStore.setState({
      pages: [
        {
          id: 'page-1',
          userId: 'u-1',
          pageName: 'Shop Thời Trang GenZ',
          pageId: 'meta-p1',
          isActive: true,
          webhookSubscribed: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      selectedPage: {
        id: 'page-1',
        userId: 'u-1',
        pageName: 'Shop Thời Trang GenZ',
        pageId: 'meta-p1',
        isActive: true,
        webhookSubscribed: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: null,
    });

    useCustomerStore.setState({
      customers: [sampleCustomer],
      selectedCustomer: null,
      customerOrders: [],
      metrics: sampleMetrics,
      filters: {
        search: '',
        tags: [],
        sortBy: 'lastInteractionAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
      isLoading: false,
      isLoadingOrders: false,
      isUpdatingTag: false,
      error: null,
    });
  });

  describe('CustomerMetrics Component', () => {
    it('render chính xác 4 thẻ số liệu Bento Grid', () => {
      render(<CustomerMetrics metrics={sampleMetrics} />);

      expect(screen.getByText('Tổng khách hàng')).toBeDefined();
      expect(screen.getByText('150')).toBeDefined();
      expect(screen.getByText('Leads có SĐT')).toBeDefined();
      expect(screen.getByText('120')).toBeDefined();
      expect(screen.getByText('Khách VIP')).toBeDefined();
      expect(screen.getByText('20')).toBeDefined();
      expect(screen.getByText('Tổng LTV tích lũy')).toBeDefined();
    });
  });

  describe('CustomerTable Component', () => {
    it('hiển thị danh sách khách hàng và các thẻ tags', () => {
      const onSelectCustomer = vi.fn();
      const onSearchChange = vi.fn();
      const onToggleTag = vi.fn();
      const onPageChange = vi.fn();

      render(
        <CustomerTable
          customers={[sampleCustomer]}
          isLoading={false}
          searchQuery=""
          onSearchChange={onSearchChange}
          selectedTags={[]}
          onToggleTag={onToggleTag}
          onSelectCustomer={onSelectCustomer}
          pagination={{ page: 1, limit: 20, total: 1, totalPages: 1 }}
          onPageChange={onPageChange}
        />
      );

      expect(screen.getByText('Trần Thị Mai')).toBeDefined();
      expect(screen.getByText('0981234567')).toBeDefined();
      expect(screen.getByText('Co_SDT')).toBeDefined();
      expect(screen.getByText('Khach_VIP')).toBeDefined();

      // Click vào dòng để xem chi tiết
      fireEvent.click(screen.getByText('Trần Thị Mai'));
      expect(onSelectCustomer).toHaveBeenCalledWith(sampleCustomer);
    });

    it('kích hoạt lọc nhanh khi click vào nút Tag', () => {
      const onToggleTag = vi.fn();
      render(
        <CustomerTable
          customers={[sampleCustomer]}
          isLoading={false}
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedTags={[]}
          onToggleTag={onToggleTag}
          onSelectCustomer={vi.fn()}
          pagination={{ page: 1, limit: 20, total: 1, totalPages: 1 }}
          onPageChange={vi.fn()}
        />
      );

      const vipFilterBtn = screen.getByText('Khách VIP');
      fireEvent.click(vipFilterBtn);
      expect(onToggleTag).toHaveBeenCalledWith('Khach_VIP');
    });
  });

  describe('CustomerDetailDrawer Component', () => {
    it('hiển thị đầy đủ thông tin khách hàng, thẻ tags và ghi chú', () => {
      const onClose = vi.fn();
      const onAddTag = vi.fn().mockResolvedValue(true);
      const onRemoveTag = vi.fn().mockResolvedValue(true);
      const onUpdateNotes = vi.fn().mockResolvedValue(true);

      render(
        <CustomerDetailDrawer
          customer={sampleCustomer}
          isOpen={true}
          onClose={onClose}
          orders={[
            {
              id: 'ord-1',
              orderCode: 'ORD-2026-001',
              status: 'completed',
              paymentStatus: 'paid',
              paymentMethod: 'vietqr',
              totalAmount: 700000,
              finalAmount: 700000,
              createdAt: '2026-10-25T10:00:00.000Z',
            },
          ]}
          isLoadingOrders={false}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onUpdateNotes={onUpdateNotes}
        />
      );

      expect(screen.getByText('Hồ sơ khách hàng CRM')).toBeDefined();
      expect(screen.getAllByText('Trần Thị Mai')).toBeDefined();
      expect(screen.getByText('ORD-2026-001')).toBeDefined();

      // Click xóa tag Co_SDT
      const deleteTagBtn = screen.getByTitle('Xóa nhãn Co_SDT');
      fireEvent.click(deleteTagBtn);
      expect(onRemoveTag).toHaveBeenCalledWith(sampleCustomer.id, 'Co_SDT');
    });
  });

  describe('CustomersPage Integration', () => {
    it('render trang tổng quan CustomersPage thành công', () => {
      render(<CustomersPage />);

      expect(screen.getByText('Quản lý Khách hàng & Leads')).toBeDefined();
      expect(screen.getByText('Shop Thời Trang GenZ')).toBeDefined();
      expect(screen.getByTestId('customer-metrics')).toBeDefined();
      expect(screen.getByTestId('customer-table')).toBeDefined();
    });
  });
});
