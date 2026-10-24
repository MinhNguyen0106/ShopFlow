/**
 * ShopFlow - Page Member Types & Normalizer
 * File: frontend/src/types/page-member.ts
 */

export type PageRole = 'owner' | 'manager' | 'staff';
export type PageMemberStatus = 'active' | 'pending' | 'revoked';

export interface PageMember {
  id: string;
  pageId: string;
  userId: string;
  role: PageRole;
  invitedBy?: string | null;
  status: PageMemberStatus;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface InviteMemberPayload {
  email: string;
  role: 'manager' | 'staff';
}

export interface UpdateMemberRolePayload {
  role: PageRole;
}

/**
 * Hàm phòng vệ bóc tách dữ liệu thành viên Fanpage (Defensive Data Parsing)
 */
export function normalizePageMember(raw: unknown): PageMember {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    id: String(r['id'] || ''),
    pageId: String(r['pageId'] || r['page_id'] || ''),
    userId: String(r['userId'] || r['user_id'] || ''),
    role:
      r['role'] === 'owner' || r['role'] === 'manager' || r['role'] === 'staff'
        ? r['role']
        : 'staff',
    invitedBy: r['invitedBy']
      ? String(r['invitedBy'])
      : r['invited_by']
        ? String(r['invited_by'])
        : null,
    status:
      r['status'] === 'active' || r['status'] === 'pending' || r['status'] === 'revoked'
        ? r['status']
        : 'active',
    email: String(r['email'] || ''),
    fullName: String(r['fullName'] || r['full_name'] || 'Thành viên'),
    createdAt: String(r['createdAt'] || r['created_at'] || new Date().toISOString()),
    updatedAt: String(r['updatedAt'] || r['updated_at'] || new Date().toISOString()),
  };
}
