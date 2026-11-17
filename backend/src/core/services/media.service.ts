/**
 * ShopFlow - Cloudinary Media Service
 * File: backend/src/core/services/media.service.ts
 *
 * Dịch vụ xử lý stream buffer từ Multer MemoryStorage lên Cloudinary đám mây.
 * Cung cấp liên kết Public HTTPS URL (secure_url) phục vụ việc xuất bản ảnh/video qua Meta Graph API.
 */

import { Readable } from 'node:stream';
import { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { cloudinary } from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import { AppError } from '../errors/app-error.js';
import { logger } from '../../utils/logger.js';

export interface UploadedMediaResult {
  url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export class MediaService {
  /**
   * Stream upload file buffer trực tiếp lên Cloudinary.
   *
   * @param buffer - Buffer nhị phân của tệp tin trong RAM
   * @param mimeType - MIME type của tệp tin (ví dụ: 'image/jpeg', 'video/mp4')
   * @param folder - Thư mục lưu trữ trên Cloudinary (mặc định: 'shopflow/posts')
   * @returns Kết quả upload bao gồm HTTPS secure_url
   */
  async uploadMedia(
    buffer: Buffer,
    mimeType: string,
    folder: string = 'shopflow/posts'
  ): Promise<UploadedMediaResult> {
    if (!buffer || buffer.length === 0) {
      throw new AppError('Dữ liệu tệp tải lên bị rỗng', 400, 'EMPTY_BUFFER');
    }

    // Đọc thông số cấu hình Cloudinary (hỗ trợ cả process.env động khi vừa cập nhật .env)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || env.CLOUDINARY_API_SECRET;
    const cloudinaryUrl = process.env.CLOUDINARY_URL || env.CLOUDINARY_URL;

    const isTest = process.env.NODE_ENV === 'test';
    const hasValidConfig =
      isTest ||
      Boolean(cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) ||
      Boolean(
        cloudName &&
        apiKey &&
        apiSecret &&
        apiKey !== 'mock_cloudinary_api_key' &&
        cloudName !== 'shopflow-dev'
      );

    if (!hasValidConfig) {
      throw new AppError(
        'Hệ thống chưa được cấu hình tài khoản Cloudinary thật trong backend/.env. Vui lòng điền CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET (hoặc CLOUDINARY_URL) để tải ảnh/video bài viết.',
        400,
        'CLOUDINARY_CONFIG_MISSING'
      );
    }

    // Tự động nhận diện và cập nhật cấu hình cho Cloudinary SDK nếu người dùng vừa điền
    if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
      cloudinary.config({ cloudinary_url: cloudinaryUrl, secure: true });
    } else if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }

    const isVideo = mimeType.startsWith('video/');

    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: isVideo ? 'video' : 'auto',
      unique_filename: true,
      overwrite: false,
    };

    // Tối ưu hóa dung lượng đối với hình ảnh
    if (!isVideo) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
      ];
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            logger.error(
              { error, mimeType, folder },
              '[MediaService] ✘ Upload stream lên Cloudinary thất bại'
            );
            return reject(
              new AppError(
                `Tải lên tệp lên Cloudinary thất bại: ${error?.message || 'Không có kết quả trả về'}`,
                502,
                'CLOUDINARY_UPLOAD_ERROR'
              )
            );
          }

          logger.info(
            {
              publicId: result.public_id,
              url: result.secure_url,
              bytes: result.bytes,
              resourceType: result.resource_type,
            },
            '[MediaService] ✔ Stream tải lên Cloudinary thành công'
          );

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration,
          });
        }
      );

      // Chuyển Buffer thành Readable stream và pipe vào uploadStream của Cloudinary
      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Xóa tệp tin trên Cloudinary bằng public_id.
   *
   * @param publicId - Định danh tệp trên Cloudinary
   * @param resourceType - Loại tài nguyên ('image' | 'video' | 'raw')
   */
  async deleteMedia(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      const isSuccess = result.result === 'ok';
      logger.info(
        { publicId, isSuccess, result: result.result },
        '[MediaService] Xóa tệp tin trên Cloudinary'
      );
      return isSuccess;
    } catch (err) {
      logger.error(
        { publicId, error: (err as Error).message },
        '[MediaService] ✘ Lỗi khi xóa tệp trên Cloudinary'
      );
      return false;
    }
  }
}

export const mediaService = new MediaService();
