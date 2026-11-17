#!/bin/bash
# ==============================================================================
# ShopFlow - PostgreSQL Automated Database Backup Script (TASK-29.3)
# File: scripts/backup-db.sh
# ==============================================================================
# Lập lịch chạy cronjob mỗi 6 giờ:
#   0 */6 * * * /opt/shopflow/scripts/backup-db.sh >> /var/log/shopflow-backup.log 2>&1
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/shopflow/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="shopflow_backup_${TIMESTAMP}.sql.gz"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
CONTAINER_NAME="${PG_CONTAINER:-shopflow_prod_postgres}"
DB_NAME="${POSTGRES_DB:-shopflow_production}"
DB_USER="${POSTGRES_USER:-shopflow_admin}"
RETENTION_DAYS=30

echo "=========================================================="
echo "📦 Starting ShopFlow Database Backup: ${TIMESTAMP}"
echo "=========================================================="

# Đảm bảo thư mục backup tồn tại
mkdir -p "${BACKUP_DIR}"

# Kiểm tra container PostgreSQL có đang chạy không
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Error: Container ${CONTAINER_NAME} is not running!" >&2
  exit 1
fi

echo "Dumping database '${DB_NAME}' from container '${CONTAINER_NAME}'..."

# Thực hiện pg_dump trực tiếp từ container qua gzip
docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILEPATH}"

# Kiểm tra dung lượng file vừa tạo
FILE_SIZE=$(du -h "${BACKUP_FILEPATH}" | cut -f1)
echo "✅ Backup successfully created: ${BACKUP_FILEPATH} (${FILE_SIZE})"

# Sinh checksum SHA256 để bảo vệ tính toàn vẹn
sha256sum "${BACKUP_FILEPATH}" > "${BACKUP_FILEPATH}.sha256"
echo "✅ Checksum generated: $(cat "${BACKUP_FILEPATH}.sha256")"

# Dọn dẹp các bản backup cũ hơn 30 ngày
echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "shopflow_backup_*.sql.gz*" -mtime "+${RETENTION_DAYS}" -exec rm -f {} \;

echo "🎉 Backup workflow finished cleanly at $(date +"%Y-%m-%d %H:%M:%S")."
