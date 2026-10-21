import React from 'react';
import { Order } from '../../types/order';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface OrderPrintModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  shopName?: string;
  shopHotline?: string;
}

export function OrderPrintModal({
  order,
  isOpen,
  onClose,
  shopName = 'ShopFlow Fashion Store',
  shopHotline = '1900 6868',
}: OrderPrintModalProps) {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[90vh]">
        {/* Modal Toolbar (Không in) */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground text-sm">
              Xem trước phiếu giao hàng (Packing Slip / A5)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Printer className="w-4 h-4" />
              In phiếu ngay
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Packing Slip Area */}
        <div className="overflow-y-auto p-6 bg-white text-black text-xs font-sans">
          <div
            id="printable-waybill"
            className="border-2 border-black p-5 rounded-lg space-y-4 max-w-xl mx-auto bg-white text-black print:border-black print:p-0 print:border-0"
          >
            {/* 1. Header & Barcode Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-3">
              <div>
                <h1 className="text-base font-black uppercase tracking-tight text-black">
                  {shopName}
                </h1>
                <p className="text-[11px] text-gray-700">Hotline hỗ trợ: {shopHotline}</p>
                <p className="text-[10px] text-gray-600">Nền tảng quản lý bán hàng ShopFlow</p>
              </div>

              <div className="text-right">
                <div className="font-mono font-black text-sm text-black">
                  {order.orderCode}
                </div>
                <div className="text-[10px] text-gray-600">
                  Ngày tạo: {formatDate(order.createdAt)}
                </div>
                {/* Simulated Barcode */}
                <div className="mt-1 h-7 w-32 bg-gray-900 flex items-center justify-center text-[9px] text-white font-mono tracking-widest ml-auto">
                  |||||||||||||||||||||
                </div>
              </div>
            </div>

            {/* 2. Sender & Receiver Blocks */}
            <div className="grid grid-cols-2 gap-3 border-b-2 border-black pb-3">
              <div className="pr-2 border-r border-gray-300">
                <span className="font-bold uppercase text-[10px] text-gray-500 block">
                  Người gửi:
                </span>
                <p className="font-bold text-black">{shopName}</p>
                <p className="text-[11px] text-gray-700">SĐT: {shopHotline}</p>
                <p className="text-[11px] text-gray-700">Kho hàng: Hà Nội / TP.HCM</p>
              </div>

              <div className="pl-2">
                <span className="font-bold uppercase text-[10px] text-gray-500 block">
                  Người nhận:
                </span>
                <p className="font-bold text-black text-sm">{order.customer.name}</p>
                <p className="font-mono font-bold text-black text-sm">
                  {/* Trên phiếu in giao hàng hiển thị rõ SĐT cho shipper */}
                  {order.customer.phone || 'Chưa cung cấp SĐT'}
                </p>
                <p className="text-[11px] text-gray-800 font-medium mt-0.5">
                  {order.customer.address || 'Khách nhận tại bưu cục'}
                </p>
              </div>
            </div>

            {/* 3. Items Table */}
            <div>
              <div className="font-bold uppercase text-[10px] text-gray-500 mb-1">
                Chi tiết kiện hàng:
              </div>
              <table className="w-full text-left border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-black text-black">
                    <th className="p-1.5 border-r border-black w-8 text-center">STT</th>
                    <th className="p-1.5 border-r border-black font-bold">Tên sản phẩm</th>
                    <th className="p-1.5 border-r border-black font-bold">Phân loại / SKU</th>
                    <th className="p-1.5 border-r border-black text-center font-bold w-12">SL</th>
                    <th className="p-1.5 text-right font-bold w-24">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-1.5 border-r border-black text-center">{idx + 1}</td>
                      <td className="p-1.5 border-r border-black font-medium">{item.name}</td>
                      <td className="p-1.5 border-r border-black font-mono text-[10px]">
                        {item.sku}
                        {item.variant && (
                          <span className="ml-1 text-gray-600">
                            ({item.variant.color || ''} {item.variant.size || ''})
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 border-r border-black text-center font-bold">
                        {item.quantity}
                      </td>
                      <td className="p-1.5 text-right font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Payment COD Box & Instructions */}
            <div className="grid grid-cols-2 gap-3 border-2 border-black p-3 bg-gray-50 rounded">
              <div>
                <span className="font-bold uppercase text-[10px] text-gray-600 block">
                  Tiền thu người nhận (COD):
                </span>
                <div className="text-xl font-black text-black mt-0.5">
                  {order.paymentMethod === 'cod' && order.paymentStatus === 'unpaid'
                    ? formatCurrency(order.finalAmount)
                    : '0 đ (Đã thanh toán)'}
                </div>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  Phương thức: {order.paymentMethod.toUpperCase()} | Trạng thái: {order.paymentStatus}
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold uppercase text-[10px] text-gray-600 block">
                  Chỉ dẫn giao hàng:
                </span>
                <p className="font-bold text-[11px] text-black mt-0.5">
                  {order.notes || 'Cho xem hàng, không cho thử.'}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Chuyển hoàn sau 3 lần không phát được
                </p>
              </div>
            </div>

            {/* 5. Signature Footer */}
            <div className="grid grid-cols-2 gap-4 pt-2 text-center text-[10px] text-gray-600">
              <div>
                <p className="font-bold uppercase text-black">Chữ ký người gửi</p>
                <p className="italic text-[9px] mt-0.5">(Xác nhận đóng gói đủ)</p>
                <div className="h-10" />
              </div>
              <div>
                <p className="font-bold uppercase text-black">Chữ ký người nhận</p>
                <p className="italic text-[9px] mt-0.5">(Đã nhận nguyên vẹn)</p>
                <div className="h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Không in) */}
        <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            In phiếu
          </button>
        </div>
      </div>
    </div>
  );
}
