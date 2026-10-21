'use client';

/**
 * ShopFlow - Media Uploader Component
 * File: frontend/src/components/posts/media-uploader.tsx
 *
 * Hỗ trợ kéo thả và upload nhiều ảnh (Album) hoặc video ngắn lên Cloudinary qua API backend.
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { PostMediaType } from '../../types/post';

interface MediaUploaderProps {
  mediaUrls: string[];
  mediaType: PostMediaType;
  onChange: (mediaUrls: string[], mediaType: PostMediaType) => void;
  disabled?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaUrls,
  mediaType,
  onChange,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const newUrls: string[] = [...mediaUrls];
      let currentType: PostMediaType = mediaType;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isImage && !isVideo) {
          throw new Error(`Định dạng tệp "${file.name}" không được hỗ trợ. Vui lòng chọn ảnh hoặc video.`);
        }

        // Quy tắc Meta: Không cho phép trộn lẫn Video và Ảnh trong một bài post
        if (isVideo) {
          if (newUrls.length > 0 && currentType === 'photo') {
            throw new Error('Facebook không hỗ trợ đăng đồng thời cả Ảnh và Video trong cùng một bài viết.');
          }
          currentType = 'video';
        } else if (isImage) {
          if (newUrls.length > 0 && currentType === 'video') {
            throw new Error('Đã có video đính kèm. Vui lòng gỡ video nếu muốn tạo bài viết Album ảnh.');
          }
          currentType = 'photo';
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post('/media/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadedUrl =
          response.data?.data?.url || response.data?.url;

        if (uploadedUrl) {
          if (currentType === 'video') {
            // Video chỉ nhận 1 tệp duy nhất
            onChange([uploadedUrl], 'video');
            setIsUploading(false);
            return;
          } else {
            newUrls.push(uploadedUrl);
          }
        }
      }

      onChange(newUrls, newUrls.length > 0 ? 'photo' : 'none');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err as Error).message ||
        'Không thể tải lên tệp tin. Vui lòng thử lại.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = mediaUrls.filter((_, idx) => idx !== indexToRemove);
    const updatedType = updated.length === 0 ? 'none' : mediaType;
    onChange(updated, updatedType);
  };

  const handleClearAll = () => {
    onChange([], 'none');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Hình ảnh & Video đính kèm
        </label>
        {mediaUrls.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled || isUploading}
            className="text-xs text-rose-400 hover:underline"
          >
            Xóa tất cả ({mediaUrls.length})
          </button>
        )}
      </div>

      {/* Drag & Drop Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled && !isUploading) fileInputRef.current?.click();
        }}
        data-testid="media-dropzone"
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] ${
          dragOver
            ? 'border-primary bg-primary/10'
            : 'border-border/60 bg-muted/20 hover:bg-muted/30 hover:border-border'
        } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
          multiple
          disabled={disabled || isUploading}
          onChange={(e) => handleFiles(e.target.files)}
          data-testid="media-file-input"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-medium text-foreground">
              Đang tải phương tiện lên máy chủ đám mây...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                Nhấn để tải lên hoặc kéo thả tệp vào đây
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Hỗ trợ tải nhiều ảnh (Album JPG, PNG, WEBP) hoặc 1 video (MP4, MOV)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div
          data-testid="media-upload-error"
          className="flex items-center gap-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Thumbnails Preview Grid */}
      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 pt-1">
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              data-testid={`media-thumbnail-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden border border-border/60 bg-card group/item shadow-sm"
            >
              {mediaType === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-2">
                  <VideoIcon className="w-6 h-6 text-violet-400" />
                  <span className="text-[10px] font-medium text-zinc-300 mt-1">Video</span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`Tệp đính kèm ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                disabled={disabled}
                data-testid={`remove-media-btn-${index}`}
                title="Gỡ tệp này"
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-rose-500 transition-colors shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Index Badge for Multi-image Album */}
              {mediaType === 'photo' && mediaUrls.length > 1 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white leading-none">
                  #{index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
