import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 ShopFlow Backend Service đang chạy thành công trên cổng ${env.PORT}`);
  logger.info(`📡 Môi trường: [${env.NODE_ENV}] | API Prefix: [${env.API_PREFIX}]`);
  logger.info(`🔗 Healthcheck URL: http://localhost:${env.PORT}/health`);
});

// Xử lý Graceful Shutdown an toàn
function handleShutdown(signal: string) {
  logger.info(`Nhận tín hiệu ${signal}. Đang tiến hành đóng máy chủ an toàn...`);
  server.close(() => {
    logger.info('Máy chủ HTTP đã đóng hoàn toàn. Tạm biệt!');
    process.exit(0);
  });

  // Ép buộc thoát nếu quá 10 giây
  setTimeout(() => {
    logger.error('Quá thời gian chờ đóng server. Buộc dừng tiến trình.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
