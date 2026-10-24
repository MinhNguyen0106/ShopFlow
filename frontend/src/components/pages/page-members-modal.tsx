'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  Loader2,
  Users,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import { usePageMemberStore } from '@/lib/page-member.store';
import { MemberRoleBadge } from './member-role-badge';
import { InviteMemberModal } from './invite-member-modal';
import { PageRole, PageMember } from '@/types/page-member';

interface PageMembersModalProps {
  isOpen: boolean;
  pageId: string;
  pageName: string;
  currentUserRole?: PageRole;
  onClose: () => void;
}

export function PageMembersModal({
  isOpen,
  pageId,
  pageName,
  currentUserRole = 'owner',
  onClose,
}: PageMembersModalProps) {
  const {
    members,
    isLoading,
    error,
    fetchMembers,
    updateRole,
    removeMember,
  } = usePageMemberStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && pageId) {
      fetchMembers(pageId);
    }
  }, [isOpen, pageId, fetchMembers]);

  if (!isOpen) return null;

  const handleRoleChange = async (member: PageMember, newRole: PageRole) => {
    if (member.role === newRole) return;
    setUpdatingMemberId(member.id);
    setFeedbackMessage(null);
    try {
      await updateRole(pageId, member.id, newRole);
      setFeedbackMessage(`Đã cập nhật vai trò của ${member.fullName} thành ${newRole}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật vai trò';
      setFeedbackMessage(msg);
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveMember = async (member: PageMember) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa thành viên "${member.fullName}" (${member.email}) khỏi Fanpage?`
      )
    ) {
      return;
    }
    setDeletingMemberId(member.id);
    setFeedbackMessage(null);
    try {
      await removeMember(pageId, member.id);
      setFeedbackMessage(`Đã xóa thành viên ${member.fullName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa thành viên';
      setFeedbackMessage(msg);
    } finally {
      setDeletingMemberId(null);
    }
  };

  const canManageRoles = currentUserRole === 'owner';
  const canInvite = currentUserRole === 'owner' || currentUserRole === 'manager';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-zinc-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Thành viên & Phân quyền</h3>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">Trang: {pageName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canInvite && (
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Mời nhân viên</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback banner */}
          {feedbackMessage && (
            <div className="px-6 py-2.5 bg-blue-500/10 border-b border-blue-500/20 text-blue-400 text-xs flex items-center justify-between">
              <span>{feedbackMessage}</span>
              <button
                onClick={() => setFeedbackMessage(null)}
                className="text-blue-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {error && (
            <div className="px-6 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Body: Members list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {isLoading && members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                <span className="text-xs">Đang tải danh sách thành viên...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Chưa có thành viên nào khác</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Hãy mời nhân viên để cùng quản lý và chăm sóc khách hàng trên Fanpage.
                </p>
              </div>
            ) : (
              members.map((member) => {
                const initials = (member.fullName || member.email || 'U')
                  .slice(0, 2)
                  .toUpperCase();

                const isSelf = false; // Could compare with current user ID if available
                const isOnlyOwner = member.role === 'owner' && members.filter((m) => m.role === 'owner').length === 1;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-all"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-inner shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">
                            {member.fullName}
                          </span>
                          <MemberRoleBadge role={member.role} />
                        </div>
                        <span className="text-xs text-zinc-400 truncate block mt-0.5">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 ml-4">
                      {/* Role selection dropdown */}
                      {canManageRoles ? (
                        <div className="relative">
                          <select
                            disabled={updatingMemberId === member.id || isOnlyOwner}
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member, e.target.value as PageRole)
                            }
                            className="text-xs bg-zinc-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 appearance-none pr-7 cursor-pointer"
                          >
                            <option value="owner">Chủ sở hữu (Owner)</option>
                            <option value="manager">Quản lý (Manager)</option>
                            <option value="staff">Nhân viên (Staff)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      ) : null}

                      {/* Remove member button */}
                      {canManageRoles || (currentUserRole === 'manager' && member.role === 'staff') ? (
                        <button
                          disabled={deletingMemberId === member.id || isOnlyOwner}
                          onClick={() => handleRemoveMember(member)}
                          title={isOnlyOwner ? 'Không thể xóa chủ sở hữu duy nhất' : 'Xóa thành viên'}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          {deletingMemberId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-white/5 bg-zinc-900/40 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>
              Chính sách PII: Nhân viên (Staff) tự động được che mờ số điện thoại khách hàng.
            </span>
            <span>Tổng cộng: {members.length} thành viên</span>
          </div>
        </div>
      </div>

      {/* Invite modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        pageId={pageId}
        pageName={pageName}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          fetchMembers(pageId);
          setFeedbackMessage('Đã gửi lời mời thành viên thành công!');
        }}
      />
    </>
  );
}
