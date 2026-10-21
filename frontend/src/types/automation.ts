/**
 * ShopFlow - Automation Rules Types & DTO Interfaces
 * File: frontend/src/types/automation.ts
 *
 * Đồng bộ hợp đồng DTO với backend và tuân thủ .agents/rules/api-contract-sync.md
 */

export interface AutomationRule {
  id: string;
  pageId: string;
  page_id?: string;
  ruleName: string;
  rule_name?: string;
  hidePhoneEnabled: boolean;
  hide_phone_enabled?: boolean;
  triggerKeywords: string[];
  trigger_keywords?: string[];
  autoCommentTemplate: string | null;
  auto_comment_template?: string | null;
  autoPrivateReplyTemplate: string | null;
  auto_private_reply_template?: string | null;
  isActive: boolean;
  is_active?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface CreateAutomationRuleInput {
  rule_name: string;
  hide_phone_enabled?: boolean;
  trigger_keywords?: string[];
  auto_comment_template?: string | null;
  auto_private_reply_template?: string | null;
  is_active?: boolean;
}

export type UpdateAutomationRuleInput = Partial<CreateAutomationRuleInput>;

/**
 * Hàm chuẩn hóa DTO (Defensive Normalizer)
 * Đảm bảo dữ liệu từ backend dù ở dạng snake_case hay camelCase đều truy cập được qua camelCase chuẩn
 */
export function normalizeAutomationRule(raw: unknown): AutomationRule {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      pageId: '',
      ruleName: '',
      hidePhoneEnabled: true,
      triggerKeywords: [],
      autoCommentTemplate: null,
      autoPrivateReplyTemplate: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const r = raw as Record<string, unknown>;

  const rawKeywords = r.triggerKeywords || r.trigger_keywords;
  let triggerKeywords: string[] = [];
  if (Array.isArray(rawKeywords)) {
    triggerKeywords = rawKeywords.map((k) => String(k).trim()).filter(Boolean);
  } else if (typeof rawKeywords === 'string') {
    try {
      const parsed = JSON.parse(rawKeywords);
      if (Array.isArray(parsed)) {
        triggerKeywords = parsed.map((k) => String(k).trim()).filter(Boolean);
      }
    } catch {
      triggerKeywords = rawKeywords.split(',').map((k) => k.trim()).filter(Boolean);
    }
  }

  const hidePhoneEnabled =
    typeof r.hidePhoneEnabled === 'boolean'
      ? r.hidePhoneEnabled
      : typeof r.hide_phone_enabled === 'boolean'
        ? r.hide_phone_enabled
        : true;

  const isActive =
    typeof r.isActive === 'boolean'
      ? r.isActive
      : typeof r.is_active === 'boolean'
        ? r.is_active
        : true;

  const id = String(r.id || '');
  const pageId = String(r.pageId || r.page_id || '');
  const ruleName = String(r.ruleName || r.rule_name || '');
  const autoCommentTemplate =
    r.autoCommentTemplate !== undefined
      ? (r.autoCommentTemplate as string | null)
      : r.auto_comment_template !== undefined
        ? (r.auto_comment_template as string | null)
        : null;
  const autoPrivateReplyTemplate =
    r.autoPrivateReplyTemplate !== undefined
      ? (r.autoPrivateReplyTemplate as string | null)
      : r.auto_private_reply_template !== undefined
        ? (r.auto_private_reply_template as string | null)
        : null;
  const createdAt = String(r.createdAt || r.created_at || new Date().toISOString());
  const updatedAt = String(r.updatedAt || r.updated_at || new Date().toISOString());

  return {
    id,
    pageId,
    page_id: pageId,
    ruleName,
    rule_name: ruleName,
    hidePhoneEnabled,
    hide_phone_enabled: hidePhoneEnabled,
    triggerKeywords,
    trigger_keywords: triggerKeywords,
    autoCommentTemplate,
    auto_comment_template: autoCommentTemplate,
    autoPrivateReplyTemplate,
    auto_private_reply_template: autoPrivateReplyTemplate,
    isActive,
    is_active: isActive,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
  };
}
