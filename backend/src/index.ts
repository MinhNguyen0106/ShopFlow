import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { testConnection, closePool } from './infrastructure/database/db.client.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 ShopFlow Backend Service đang chạy thành công trên cổng ${env.PORT}`);
  logger.info(`📡 Môi trường: [${env.NODE_ENV}] | API Prefix: [${env.API_PREFIX}]`);
  logger.info(`🔗 Healthcheck URL: http://localhost:${env.PORT}/health`);

  // Kiểm tra kết nối Database ngay sau khi server khởi động
  if (env.DATABASE_URL) {
    testConnection()
      .then((ok) => {
        if (!ok) {
          logger.warn('[startup] Không thể kết nối database. Các tính năng DB sẽ không hoạt động.');
        }
      })
      .catch((err: unknown) => {
        logger.error({ err }, '[startup] Lỗi nghiêm trọng khi kiểm tra kết nối database');
      });
  } else {
    logger.warn('[startup] DATABASE_URL chưa được cấu hình — bỏ qua kiểm tra kết nối DB');
  }
});

// ============================================================================
// Xử lý Graceful Shutdown an toàn (HTTP server + DB pool)
// ============================================================================
async function handleShutdown(signal: string): Promise<void> {
  logger.info(`Nhận tín hiệu ${signal}. Đang tiến hành đóng máy chủ an toàn...`);

  // Đóng HTTP server (ngừng nhận request mới)
  await new Promise<void>((resolve) => {
    server.close(() => {
      logger.info('Máy chủ HTTP đã đóng hoàn toàn.');
      resolve();
    });
  });

  // Đóng Database pool
  await closePool();

  logger.info('✔ Graceful shutdown hoàn tất. Tạm biệt!');
  process.exit(0);
}

// Ép buộc thoát nếu quá 15 giây
const SHUTDOWN_TIMEOUT_MS = 15_000;

process.on('SIGTERM', () => {
  setTimeout(() => {
    logger.error('Quá thời gian chờ shutdown. Buộc dừng tiến trình.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  void handleShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  setTimeout(() => {
    logger.error('Quá thời gian chờ shutdown. Buộc dừng tiến trình.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  void handleShutdown('SIGINT');
});

