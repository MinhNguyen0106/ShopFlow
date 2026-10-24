import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberRoleBadge } from '../member-role-badge';
import { PageMembersModal } from '../page-members-modal';
import { InviteMemberModal } from '../invite-member-modal';
import { usePageMemberStore } from '../../../lib/page-member.store';
import { apiClient } from '../../../lib/api-client';
import { normalizePageMember } from '../../../types/page-member';

vi.mock('../../../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Page Members Components & Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePageMemberStore.getState().reset();
  });

  describe('normalizePageMember', () => {
    it('bóc tách phòng vệ an toàn dữ liệu từ backend', () => {
      const raw = {
        id: 'pm-1',
        page_id: 'page-101',
        user_id: 'u-1',
        role: 'manager',
        email: 'manager@shopflow.vn',
        full_name: 'Nguyễn Quản Lý',
      };

      const normalized = normalizePageMember(raw);

      expect(normalized.id).toBe('pm-1');
      expect(normalized.pageId).toBe('page-101');
      expect(normalized.role).toBe('manager');
      expect(normalized.email).toBe('manager@shopflow.vn');
      expect(normalized.fullName).toBe('Nguyễn Quản Lý');
      expect(normalized.status).toBe('active');
    });

    it('fallback về giá trị mặc định khi dữ liệu rỗng', () => {
      const normalized = normalizePageMember(null);

      expect(normalized.id).toBe('');
      expect(normalized.role).toBe('staff');
      expect(normalized.fullName).toBe('Thành viên');
      expect(normalized.status).toBe('active');
    });
  });

  describe('MemberRoleBadge', () => {
    it('hiển thị đúng nhãn và màu sắc cho Owner', () => {
      const badge = MemberRoleBadge({ role: 'owner' });
      expect(badge.props.className).toContain('text-purple-400');
    });

    it('hiển thị đúng nhãn và màu sắc cho Manager', () => {
      const badge = MemberRoleBadge({ role: 'manager' });
      expect(badge.props.className).toContain('text-blue-400');
    });

    it('hiển thị đúng nhãn và màu sắc cho Staff', () => {
      const badge = MemberRoleBadge({ role: 'staff' });
      expect(badge.props.className).toContain('text-emerald-400');
    });
  });

  describe('usePageMemberStore', () => {
    it('fetchMembers tải và chuẩn hóa danh sách thành viên', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            members: [
              {
                id: 'pm-1',
                page_id: 'page-1',
                user_id: 'u-1',
                role: 'owner',
                email: 'owner@shopflow.vn',
                full_name: 'Chủ Shop',
              },
            ],
          },
        },
      });

      await usePageMemberStore.getState().fetchMembers('page-1');

      const state = usePageMemberStore.getState();
      expect(state.members).toHaveLength(1);
      expect(state.members[0]?.role).toBe('owner');
      expect(state.members[0]?.email).toBe('owner@shopflow.vn');
      expect(state.isLoading).toBe(false);
    });

    it('inviteMember gửi request và thêm thành viên vào danh sách', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            member: {
              id: 'pm-2',
              page_id: 'page-1',
              user_id: 'u-2',
              role: 'staff',
              email: 'staff@shopflow.vn',
              full_name: 'Nhân Viên',
            },
          },
        },
      });

      const member = await usePageMemberStore.getState().inviteMember('page-1', {
        email: 'staff@shopflow.vn',
        role: 'staff',
      });

      expect(member.id).toBe('pm-2');
      expect(member.role).toBe('staff');
      expect(usePageMemberStore.getState().members).toHaveLength(1);
    });

    it('updateRole cập nhật vai trò của thành viên trong store', async () => {
      usePageMemberStore.setState({
        members: [
          {
            id: 'pm-1',
            pageId: 'page-1',
            userId: 'u-1',
            role: 'staff',
            status: 'active',
            email: 'user@shopflow.vn',
            fullName: 'User 1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            member: {
              id: 'pm-1',
              page_id: 'page-1',
              user_id: 'u-1',
              role: 'manager',
              email: 'user@shopflow.vn',
              full_name: 'User 1',
            },
          },
        },
      });

      await usePageMemberStore.getState().updateRole('page-1', 'pm-1', 'manager');

      const updated = usePageMemberStore.getState().members[0];
      expect(updated?.role).toBe('manager');
    });

    it('removeMember loại bỏ thành viên khỏi store', async () => {
      usePageMemberStore.setState({
        members: [
          {
            id: 'pm-1',
            pageId: 'page-1',
            userId: 'u-1',
            role: 'staff',
            status: 'active',
            email: 'user@shopflow.vn',
            fullName: 'User 1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });

      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true },
      });

      await usePageMemberStore.getState().removeMember('page-1', 'pm-1');

      expect(usePageMemberStore.getState().members).toHaveLength(0);
    });
  });

  describe('Modal Rendering', () => {
    it('trả về null khi isOpen là false', () => {
      const pageMembersModal = PageMembersModal({
        isOpen: false,
        pageId: 'page-1',
        pageName: 'Shop A',
        onClose: vi.fn(),
      });
      expect(pageMembersModal).toBeNull();

      const inviteModal = InviteMemberModal({
        isOpen: false,
        pageId: 'page-1',
        pageName: 'Shop A',
        onClose: vi.fn(),
      });
      expect(inviteModal).toBeNull();
    });

    it('render UI đầy đủ khi isOpen là true', () => {
      const pageMembersModal = PageMembersModal({
        isOpen: true,
        pageId: 'page-1',
        pageName: 'Shop Thời Trang',
        onClose: vi.fn(),
      });
      expect(pageMembersModal).not.toBeNull();
    });
  });
});
