'use client';

/**
 * ShopFlow - Post Editor Component
 * File: frontend/src/components/posts/post-editor.tsx
 *
 * Trình soạn thảo văn bản bài viết, bộ chọn Fanpage, đếm ký tự và gợi ý hashtags.
 */

import React from 'react';
import { Layers, Hash, Smile, Sparkles } from 'lucide-react';

interface ConnectedPageItem {
  id: string;
  pageId: string;
  pageName: string;
}

interface PostEditorProps {
  content: string;
  onChange: (content: string) => void;
  selectedPageId: string;
  onPageChange: (pageId: string) => void;
  pages: ConnectedPageItem[];
  disabled?: boolean;
}

const POPULAR_HASHTAGS = [
  '#sale',
  '#freeship',
  '#shopflow',
  '#hotdeal',
  '#giare',
  '#xuhuong',
  '#hangmoive',
];

const QUICK_EMOJIS = ['🔥', '⚡', '🎁', '💥', '✨', '👉', '❤️'];

export const PostEditor: React.FC<PostEditorProps> = ({
  content,
  onChange,
  selectedPageId,
  onPageChange,
  pages,
  disabled = false,
}) => {
  const handleInsertText = (textToInsert: string) => {
    if (disabled) return;
    const separator = content.length > 0 && !content.endsWith(' ') && !content.endsWith('\n') ? ' ' : '';
    onChange(`${content}${separator}${textToInsert} `);
  };

  return (
    <div className="space-y-4">
      {/* Target Fanpage Selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
          Fanpage xuất bản bài viết <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Layers className="w-4 h-4" />
          </div>
          <select
            value={selectedPageId}
            onChange={(e) => onPageChange(e.target.value)}
            disabled={disabled}
            data-testid="post-editor-page-select"
            aria-label="Chọn Fanpage đăng bài"
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-border/60 bg-background text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer disabled:opacity-60"
          >
            <option value="">-- Chọn Fanpage đích --</option>
            {pages.map((p) => (
              <option key={p.id} value={p.pageId}>
                {p.pageName} (ID: {p.pageId})
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Content Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nội dung bài viết <span className="text-rose-400">*</span>
          </label>
          <span
            data-testid="post-character-count"
            className="text-[11px] font-mono text-muted-foreground"
          >
            {content.length} ký tự
          </span>
        </div>

        <div className="relative border border-border/60 rounded-2xl bg-card/60 backdrop-blur-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            data-testid="post-content-textarea"
            placeholder="Bạn đang muốn chia sẻ điều gì với khách hàng trên Fanpage? Nhập nội dung, chương trình khuyến mãi hoặc mô tả sản phẩm..."
            rows={7}
            className="w-full p-4 bg-transparent text-foreground text-sm leading-relaxed placeholder:text-muted-foreground/60 resize-none focus:outline-none disabled:opacity-60"
          />

          {/* Quick Toolbar (Hashtags & Emojis) */}
          <div className="p-3 border-t border-border/30 bg-muted/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Quick Emojis */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground mr-1 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5" />
              </span>
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleInsertText(emoji)}
                  disabled={disabled}
                  data-testid={`quick-emoji-${emoji}`}
                  className="px-1.5 py-0.5 rounded hover:bg-muted/40 transition-colors text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Hashtags */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-muted-foreground mr-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                Gợi ý:
              </span>
              {POPULAR_HASHTAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertText(tag)}
                  disabled={disabled}
                  data-testid={`quick-hashtag-${tag}`}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
