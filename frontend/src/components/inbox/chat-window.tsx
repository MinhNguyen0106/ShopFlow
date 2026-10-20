'use client';

/**
 * ShopFlow - Inbox Pane 3: Chat Window & Security Shield
 * File: frontend/src/components/inbox/chat-window.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { useInboxStore } from '@/lib/inbox.store';
import { QuickMacro } from '@/types/inbox';

const QUICK_MACROS: QuickMacro[] = [
  {
    shortcut: '/size',
    label: 'Tư vấn Size',
    text: 'Dạ bạn cho shop xin chiều cao & cân nặng để shop tư vấn chuẩn size đẹp nhất cho mình nhé! ❤️',
  },
  {
    shortcut: '/gia',
    label: 'Báo Giá Khuyến Mãi',
    text: 'Dạ mẫu này hiện đang có chương trình trợ giá đặc biệt hôm nay: chỉ 199.000đ (giá niêm yết 280.000đ) ạ! ✨',
  },
  {
    shortcut: '/bank',
    label: 'Thông Tin Chuyển Khoản',
    text: 'Dạ thông tin STK của shop:\n- Ngân hàng: MB Bank\n- STK: 0987654321\n- Chủ TK: SHOPFLOW OFFICIAL\nNội dung: [SĐT nhận hàng] + [Tên SP]',
  },
  {
    shortcut: '/chot',
    label: 'Xác Nhận Đơn Hàng',
    text: 'Dạ shop đã tiếp nhận đơn hàng của bạn. Đơn sẽ được kiểm tra và bàn giao bưu tá trong 24h tới nhé! Cảm ơn bạn rất nhiều! 🎉',
  },
];

export function ChatWindow() {
  const {
    selectedConversation,
    messages,
    isLoadingMessages,
    isSendingMessage,
    sendMessage,
    sendPrivateReply,
    toggleHideMessage,
    updateConversationStatus,
  } = useInboxStore();

  const [inputContent, setInputContent] = useState('');
  const [showMacros, setShowMacros] = useState(false);
  const [privateReplyModal, setPrivateReplyModal] = useState<{ messageId: string } | null>(null);
  const [privateReplyText, setPrivateReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim() || isSendingMessage) return;

    const ok = await sendMessage(inputContent);
    if (ok) {
      setInputContent('');
      setShowMacros(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectMacro = (macroText: string) => {
    setInputContent(macroText);
    setShowMacros(false);
  };

  const handleSendPrivateReplySubmit = async () => {
    if (!privateReplyModal || !privateReplyText.trim()) return;
    const ok = await sendPrivateReply(privateReplyModal.messageId, privateReplyText);
    if (ok) {
      setPrivateReplyModal(null);
      setPrivateReplyText('');
    }
  };

  if (!selectedConversation) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-slate-50/50 p-8 text-center select-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm mb-4">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-slate-800">Chưa chọn cuộc hội thoại</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Hãy nhấp chọn một khách hàng từ danh sách bên trái để bắt đầu trả lời tin nhắn, bảo vệ SĐT và chốt đơn.
        </p>
      </div>
    );
  }

  const customerName =
    selectedConversation.customer?.customerName ||
    selectedConversation.customer?.customer_name ||
    'Khách Hàng Facebook';
  const pageName = selectedConversation.pageName || selectedConversation.page_name || 'Fanpage';
  const isMessenger = selectedConversation.type === 'messenger';
  const is24hExpired =
    isMessenger &&
    (selectedConversation.isWithin24h === false || selectedConversation.is_within_24h === false);

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-800">{customerName}</h2>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {isMessenger ? '💬 Messenger' : '📝 Comment Post'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Đang tiếp nhận qua: <span className="font-semibold text-slate-600">{pageName}</span>
            </p>
          </div>
        </div>

        {/* Action Status Menu */}
        <div className="flex items-center gap-2">
          <select
            value={selectedConversation.status}
            onChange={(e) => updateConversationStatus(e.target.value as 'open' | 'resolved' | 'archived')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="open">🟢 Đang mở (Open)</option>
            <option value="resolved">🔵 Đã xong (Resolved)</option>
            <option value="archived">⚪ Lưu trữ (Archived)</option>
          </select>
        </div>
      </div>

      {/* Security Shield Banner (Chống Cướp Khách) */}
      <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/70 px-4 py-2 text-xs text-indigo-900">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
            🛡️
          </span>
          <span className="text-[11px] font-medium">
            <strong>ShopFlow Shield:</strong> Bảo vệ tự động nhận diện & ẩn SĐT công khai dưới 3s
          </span>
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 font-mono">
          AES-256 Meta Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
        {isLoadingMessages ? (
          <div className="flex h-32 items-center justify-center text-xs text-slate-400">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            Đang tải lịch sử trò chuyện...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-xs text-slate-400">
            <span>Chưa có tin nhắn trong cuộc hội thoại này</span>
            <span className="text-[11px] text-slate-400 mt-1">Hãy gửi tin nhắn đầu tiên bên dưới</span>
          </div>
        ) : (
          messages.map((msg) => {
            const senderType = msg.senderType || msg.sender_type;
            const isPage = senderType === 'page';
            const isHidden = msg.isHidden || msg.is_hidden;
            const privateReplySent = msg.privateReplySent || msg.private_reply_sent;
            const isComment = selectedConversation.type === 'comment_thread';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isPage ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Tag */}
                <div className="mb-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
                  <span>{isPage ? pageName : customerName}</span>
                  <span>•</span>
                  <span>
                    {msg.createdAt || msg.created_at
                      ? new Date(msg.createdAt || msg.created_at || '').toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                  {isHidden && (
                    <span className="rounded-xs bg-amber-100 px-1 text-[9px] font-semibold text-amber-800">
                      Đã ẩn công khai
                    </span>
                  )}
                </div>

                {/* Bubble Container */}
                <div
                  className={`group relative max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                    isPage
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content || '(Tệp đính kèm)'}</p>

                  {/* Actions for Comment messages (Hide/Unhide, Private Reply) */}
                  {isComment && !isPage && (
                    <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-1.5 text-[10px]">
                      <button
                        onClick={() => toggleHideMessage(msg.id, !isHidden)}
                        className={`font-medium ${
                          isHidden ? 'text-amber-600 hover:underline' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {isHidden ? '👁️ Hiện lại bình luận' : '🙈 Ẩn bình luận'}
                      </button>

                      <span>•</span>

                      {privateReplySent ? (
                        <span className="text-emerald-600 font-medium">✓ Đã Private Reply</span>
                      ) : (
                        <button
                          onClick={() => {
                            setPrivateReplyModal({ messageId: msg.id });
                            setPrivateReplyText('');
                          }}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          💬 Gửi Private Reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Meta 24h Policy Warning */}
      {is24hExpired && (
        <div className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-[11px] text-rose-800">
          ⚠️ <strong>Cửa sổ 24h Meta đã hết hạn:</strong> Theo chính sách Meta, Fanpage không thể gửi tin nhắn tự do cho khách nếu khách không phản hồi trong 24h qua.
        </div>
      )}

      {/* Quick Macro Bar */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto select-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Macro:
        </span>
        {QUICK_MACROS.map((macro) => (
          <button
            key={macro.shortcut}
            onClick={() => handleSelectMacro(macro.text)}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors"
          >
            <span className="font-mono text-emerald-600 font-semibold">{macro.shortcut}</span>{' '}
            {macro.label}
          </button>
        ))}
      </div>

      {/* Message Composer */}
      <div className="border-t border-slate-200 p-3 bg-white">
        <form onSubmit={handleSend} className="relative flex flex-col gap-2">
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedConversation.type === 'comment_thread'
                ? 'Nhập bình luận trả lời khách hàng công khai... (Enter để gửi)'
                : 'Nhập tin nhắn Messenger... (Enter để gửi, Shift+Enter xuống dòng)'
            }
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Nhấn <strong>Enter</strong> để gửi, <strong>Shift + Enter</strong> để xuống dòng
            </span>

            <button
              type="submit"
              disabled={!inputContent.trim() || isSendingMessage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingMessage ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang gửi...
                </>
              ) : (
                <>
                  Gửi {selectedConversation.type === 'messenger' ? 'tin nhắn' : 'bình luận'}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Private Reply Modal */}
      {privateReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Gửi Tin Nhắn Riêng (Private Reply)</h3>
            <p className="mt-1 text-xs text-slate-500">
              Khách hàng bình luận trên bài viết sẽ nhận được tin nhắn trực tiếp qua Messenger từ Fanpage (Hạn 7 ngày theo chuẩn Meta).
            </p>

            <textarea
              value={privateReplyText}
              onChange={(e) => setPrivateReplyText(e.target.value)}
              placeholder="Nhập nội dung tư vấn gửi riêng cho khách..."
              rows={4}
              className="mt-3 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setPrivateReplyModal(null)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSendPrivateReplySubmit}
                disabled={!privateReplyText.trim()}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                Gửi Private Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
