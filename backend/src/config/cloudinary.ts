/**
 * ShopFlow - Cloudinary SDK Configuration
 * File: backend/src/config/cloudinary.ts
 *
 * Cấu hình kết nối Cloudinary cho dịch vụ lưu trữ media (ảnh/video) đăng bài Fanpage.
 */

import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

if (env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: env.CLOUDINARY_URL,
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

logger.info(
  {
    cloudName: env.CLOUDINARY_CLOUD_NAME || (env.CLOUDINARY_URL ? 'from_url' : 'not_set'),
    hasUrl: Boolean(env.CLOUDINARY_URL),
  },
  '[Cloudinary] ✔ Đã khởi tạo cấu hình Cloudinary SDK'
);

export { cloudinary };
export default cloudinary;
