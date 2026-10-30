import React, { useState, useEffect } from 'react';
import { Customer, CustomerOrder } from '../../types/customer';
import {
  X,
  User,
  Phone,
  MapPin,
  Copy,
  Check,
  Tag,
  Plus,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
  isLoadingOrders?: boolean;
  onAddTag: (customerId: string, tag: string) => Promise<boolean>;
  onRemoveTag: (customerId: string, tag: string) => Promise<boolean>;
  onUpdateNotes: (customerId: string, notes: string) => Promise<boolean>;
  isUpdatingTag?: boolean;
}

const PRESET_TAGS = ['Khach_VIP', 'Co_SDT', 'Da_mua_hang', 'Uu_tien_giao'];

export function CustomerDetailDrawer({
  customer,
  isOpen,
  onClose,
  orders,
  isLoadingOrders = false,
  onAddTag,
  onRemoveTag,
  onUpdateNotes,
  isUpdatingTag = false,
}: CustomerDetailDrawerProps) {
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  useEffect(() => {
    if (customer) {
      setNotesInput(customer.notes || '');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
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

  const handleCopyPhone = () => {
    if (customer.phoneNumber) {
      navigator.clipboard.writeText(customer.phoneNumber);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleAddTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const ok = await onAddTag(customer.id, newTagInput.trim());
    if (ok) setNewTagInput('');
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const ok = await onUpdateNotes(customer.id, notesInput.trim());
    setIsSavingNotes(false);
    if (ok) {
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2000);
    }
  };

  const initials = customer.customerName
    ? customer.customerName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'KH';

  const aov =
    customer.totalOrders > 0
      ? Math.round(customer.lifetimeValue / customer.totalOrders)
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" data-testid="customer-detail-drawer">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-right duration-200">
          {/* Header với macOS Traffic Lights */}
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Hồ sơ khách hàng CRM
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Avatar & Bio Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-200/80 dark:border-slate-800 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {customer.customerName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-2">
                  Facebook PSID: {customer.customerFbId}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  {customer.phoneNumber ? (
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{customer.phoneNumber}</span>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="ml-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Sao chép SĐT"
                      >
                        {copiedPhone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Chưa có SĐT</span>
                  )}

                  {customer.address && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Overview (3 Bento Mini Boxes) */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Chỉ số chi tiêu (LTV)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Tổng chi tiêu
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(customer.lifetimeValue)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Tổng số đơn
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {customer.totalOrders} đơn
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Giá trị TB (AOV)
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(aov)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Manager */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Quản lý nhãn phân loại
                </h4>
                {isUpdatingTag && (
                  <span className="text-[11px] text-blue-600 animate-pulse">
                    Đang lưu tag...
                  </span>
                )}
              </div>

              {/* Tag list */}
              <div className="flex items-center gap-1.5 flex-wrap mb-3 min-h-[32px]">
                {customer.tags.length > 0 ? (
                  customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => onRemoveTag(customer.id, tag)}
                        className="hover:text-red-600 transition-colors ml-0.5"
                        title={`Xóa nhãn ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Chưa có nhãn tag nào
                  </span>
                )}
              </div>

              {/* Add tag form */}
              <form onSubmit={handleAddTagSubmit} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Nhập tên tag mới..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!newTagInput.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm tag
                </button>
              </form>

              {/* Preset tags quick add */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Gợi ý:</span>
                {PRESET_TAGS.map((tag) => {
                  const alreadyHas = customer.tags.includes(tag);
                  if (alreadyHas) return null;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onAddTag(customer.id, tag)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all"
                    >
                      +{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Ghi chú nội bộ
                </h4>
                {notesSavedSuccess && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3" /> Đã lưu thành công
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Thêm sở thích, yêu cầu đặc biệt của khách hàng..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder:text-slate-400 mb-2"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-all"
              >
                {isSavingNotes ? 'Đang lưu...' : 'Lưu ghi chú nội bộ'}
              </button>
            </div>

            {/* Purchase History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" /> Lịch sử đơn hàng ({orders.length})
              </h4>

              {isLoadingOrders ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Đang nạp lịch sử đơn hàng...
                </div>
              ) : orders.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
                  Khách hàng chưa phát sinh đơn hàng nào.
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                            {ord.orderCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              ord.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : ord.status === 'shipping'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                : ord.status === 'cancelled'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {formatDate(ord.createdAt)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {formatCurrency(ord.finalAmount)}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase">
                          {ord.paymentMethod}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
