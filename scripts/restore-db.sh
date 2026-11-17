#!/bin/bash
# ==============================================================================
# ShopFlow - PostgreSQL Database Restoration Script (TASK-29.3)
# File: scripts/restore-db.sh
# ==============================================================================
# Cách sử dụng:
#   ./scripts/restore-db.sh /var/backups/shopflow/postgres/shopflow_backup_YYYYMMDD_HHMMSS.sql.gz
# ==============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "❌ Error: Missing backup file argument." >&2
  echo "Usage: $0 <path_to_backup_file.sql.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${PG_CONTAINER:-shopflow_prod_postgres}"
DB_NAME="${POSTGRES_DB:-shopflow_production}"
DB_USER="${POSTGRES_USER:-shopflow_admin}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file '${BACKUP_FILE}' does not exist!" >&2
  exit 1
fi

echo "=========================================================="
echo "⚠️  WARNING: STARTING DATABASE RESTORATION PROCESS"
echo "Target DB: ${DB_NAME} in container ${CONTAINER_NAME}"
echo "Source File: ${BACKUP_FILE}"
echo "=========================================================="

# Kiểm tra checksum nếu tệp .sha256 tồn tại
if [ -f "${BACKUP_FILE}.sha256" ]; then
  echo "Verifying SHA256 checksum..."
  cd "$(dirname "${BACKUP_FILE}")"
  sha256sum -c "$(basename "${BACKUP_FILE}.sha256")"
  echo "✅ Checksum verification passed."
fi

# Kiểm tra container có đang hoạt động không
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Error: Container ${CONTAINER_NAME} is not running!" >&2
  exit 1
fi

echo "Restoring database data from backup..."
# Giải nén và nạp trực tiếp qua psql vào container
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "=========================================================="
echo "🎉 Database restoration completed successfully!"
echo "Finished at: $(date +"%Y-%m-%d %H:%M:%S")"
echo "=========================================================="
