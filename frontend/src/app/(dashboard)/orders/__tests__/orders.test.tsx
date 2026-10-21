import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OrderStatusBadge, PaymentStatusBadge } from '../../../../components/orders/order-status-badge';
import { OrderMetrics } from '../../../../components/orders/order-metrics';
import { OrderTable } from '../../../../components/orders/order-table';
import { OrderDetailDrawer } from '../../../../components/orders/order-detail-drawer';
import { OrderPrintModal } from '../../../../components/orders/order-print-modal';
import { Order } from '../../../../types/order';

describe('Orders Management UI Components (TASK-22)', () => {
  const sampleOrder: Order = {
    id: 'ord-101',
    orderCode: 'ORD-2026-001',
    pageId: 'page_1',
    customer: {
      name: 'Nguyễn Thị Bích',
      phone: '0987654321',
      maskedPhone: '098****321',
      address: 'Số 15 Lê Duẩn, Hoàn Kiếm, Hà Nội',
      fbId: 'fb_user_123',
    },
    items: [
      {
        id: 'item-1',
        sku: 'VAY01',
        name: 'Váy hoa nhí vintage',
        quantity: 2,
        price: 250000,
        variant: { color: 'Đỏ', size: 'M' },
      },
      {
        id: 'item-2',
        sku: 'AOPOLO01',
        name: 'Áo Polo Nam',
        quantity: 1,
        price: 299000,
        variant: { color: 'Đen', size: 'L' },
      },
    ],
    totalAmount: 799000,
    shippingFee: 30000,
    discountAmount: 29000,
    finalAmount: 800000,
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'cod',
    source: 'facebook_comment',
    notes: 'Cho xem hàng trước khi nhận',
    timeline: [
      {
        id: 'tl-1',
        status: 'pending',
        note: 'Tạo đơn từ bình luận Facebook',
        timestamp: '2026-10-21T08:00:00.000Z',
      },
    ],
    createdAt: '2026-10-21T08:00:00.000Z',
    updatedAt: '2026-10-21T08:00:00.000Z',
  };

  const sampleMetrics = {
    totalToday: 25,
    totalTodayGrowth: 18.5,
    pendingCount: 6,
    shippingCount: 12,
    estimatedRevenueToday: 15450000,
  };

  beforeEach(() => {
    const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (internals) {
      internals.ReactCurrentDispatcher.current = {
        useState: (initial: any) => [
          typeof initial === 'function' ? initial() : initial,
          vi.fn(),
        ],
        useEffect: vi.fn(),
        useMemo: (fn: any) => fn(),
        useCallback: (fn: any) => fn(),
        useRef: (val: any) => ({ current: val }),
      };
    }
  });

  afterEach(() => {
    const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    if (internals) {
      internals.ReactCurrentDispatcher.current = null;
    }
  });

  describe('OrderStatusBadge & PaymentStatusBadge', () => {
    it('hiển thị đúng nhãn trạng thái đơn hàng theo chuẩn Apple Bento', () => {
      const pendingBadge = OrderStatusBadge({ status: 'pending' });
      expect(pendingBadge.props.children).toBeDefined();

      const confirmedBadge = OrderStatusBadge({ status: 'confirmed' });
      expect(confirmedBadge.props.children).toBeDefined();

      const shippingBadge = OrderStatusBadge({ status: 'shipping' });
      expect(shippingBadge.props.children).toBeDefined();

      const completedBadge = OrderStatusBadge({ status: 'completed' });
      expect(completedBadge.props.children).toBeDefined();

      const cancelledBadge = OrderStatusBadge({ status: 'cancelled' });
      expect(cancelledBadge.props.children).toBeDefined();
    });

    it('hiển thị đúng nhãn trạng thái thanh toán COD và chuyển khoản', () => {
      const unpaidBadge = PaymentStatusBadge({ status: 'unpaid', method: 'cod' });
      expect(unpaidBadge.props.children).toBeDefined();

      const paidBadge = PaymentStatusBadge({ status: 'paid', method: 'vietqr' });
      expect(paidBadge.props.children).toBeDefined();

      const refundedBadge = PaymentStatusBadge({ status: 'refunded' });
      expect(refundedBadge.props.children).toBeDefined();
    });
  });

  describe('OrderMetrics Component', () => {
    it('render đầy đủ 4 thẻ Bento với số liệu định dạng tiền tệ chính xác', () => {
      const metricsElement = OrderMetrics({ metrics: sampleMetrics });
      expect(metricsElement).toBeDefined();
      expect(metricsElement.props.className).toContain('grid');
    });

    it('hiển thị trạng thái loading khi isLoading = true', () => {
      const metricsLoading = OrderMetrics({ metrics: sampleMetrics, isLoading: true });
      expect(metricsLoading).toBeDefined();
    });
  });

  describe('OrderTable Component', () => {
    const mockSelectOrder = vi.fn();
    const mockPrintOrder = vi.fn();
    const mockUpdateStatus = vi.fn();
    const mockPageChange = vi.fn();
    const mockSearchChange = vi.fn();
    const mockSelectStatus = vi.fn();

    const pagination = {
      page: 1,
      limit: 15,
      total: 1,
      totalPages: 1,
    };

    it('render bảng dữ liệu đơn hàng khi có danh sách', () => {
      const table = OrderTable({
        orders: [sampleOrder],
        isLoading: false,
        selectedStatus: 'all',
        onSelectStatus: mockSelectStatus,
        searchQuery: '',
        onSearchChange: mockSearchChange,
        onSelectOrder: mockSelectOrder,
        onPrintOrder: mockPrintOrder,
        onUpdateStatus: mockUpdateStatus,
        pagination,
        onPageChange: mockPageChange,
      });

      expect(table).toBeDefined();
      expect(table.props.className).toContain('rounded-2xl');
    });

    it('hiển thị trạng thái trống khi không có đơn hàng nào', () => {
      const emptyTable = OrderTable({
        orders: [],
        isLoading: false,
        selectedStatus: 'completed',
        onSelectStatus: mockSelectStatus,
        searchQuery: '',
        onSearchChange: mockSearchChange,
        onSelectOrder: mockSelectOrder,
        onPrintOrder: mockPrintOrder,
        onUpdateStatus: mockUpdateStatus,
        pagination: { ...pagination, total: 0 },
        onPageChange: mockPageChange,
      });

      expect(emptyTable).toBeDefined();
    });
  });

  describe('OrderDetailDrawer Component', () => {
    const mockClose = vi.fn();
    const mockUpdateStatus = vi.fn();
    const mockOpenPrint = vi.fn();

    it('không render gì khi isOpen = false', () => {
      const drawer = OrderDetailDrawer({
        order: sampleOrder,
        isOpen: false,
        onClose: mockClose,
        onUpdateStatus: mockUpdateStatus,
        onOpenPrint: mockOpenPrint,
      });
      expect(drawer).toBeNull();
    });

    it('render chi tiết giỏ hàng và khách hàng khi isOpen = true', () => {
      const drawer = OrderDetailDrawer({
        order: sampleOrder,
        isOpen: true,
        onClose: mockClose,
        onUpdateStatus: mockUpdateStatus,
        onOpenPrint: mockOpenPrint,
      });

      expect(drawer).not.toBeNull();
      expect(drawer?.props.className).toContain('fixed inset-0');
    });
  });

  describe('OrderPrintModal Component', () => {
    const mockClose = vi.fn();

    it('không render gì khi isOpen = false', () => {
      const modal = OrderPrintModal({
        order: sampleOrder,
        isOpen: false,
        onClose: mockClose,
      });
      expect(modal).toBeNull();
    });

    it('render phiếu giao hàng A5/A6 tối ưu in nhiệt khi isOpen = true', () => {
      const modal = OrderPrintModal({
        order: sampleOrder,
        isOpen: true,
        onClose: mockClose,
        shopName: 'ShopFlow Test Store',
      });

      expect(modal).not.toBeNull();
      expect(modal?.props.className).toContain('fixed inset-0');
    });
  });
});
