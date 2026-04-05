#!/bin/bash
# ─── CareOS Database Backup Script ──────────────────────────
# Usage: ./scripts/backup-db.sh
# Cron:  0 2 * * * /path/to/careos/scripts/backup-db.sh
#
# Backs up SurrealDB and stores in ./backups/ with date stamp.
# Retains last 30 days of backups.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
SURREAL_URL="${SURREALDB_URL:-ws://localhost:8000}"
SURREAL_USER="${SURREALDB_USER:-root}"
SURREAL_PASS="${SURREALDB_PASS:-root}"
SURREAL_NS="${SURREALDB_NAMESPACE:-careos}"
SURREAL_DB="${SURREALDB_DATABASE:-production}"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/careos_${TIMESTAMP}.surql"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting CareOS database backup..."

# Export SurrealDB
# Replace ws:// with http:// for the export endpoint
HTTP_URL=$(echo "$SURREAL_URL" | sed 's|ws://|http://|' | sed 's|/rpc||')

curl -s -u "${SURREAL_USER}:${SURREAL_PASS}" \
  -H "NS: ${SURREAL_NS}" \
  -H "DB: ${SURREAL_DB}" \
  -H "Accept: application/octet-stream" \
  "${HTTP_URL}/export" \
  -o "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"
FINAL_FILE="${BACKUP_FILE}.gz"

# Show size
SIZE=$(du -h "$FINAL_FILE" | cut -f1)
echo "[$(date)] Backup complete: $FINAL_FILE ($SIZE)"

# Clean old backups
find "$BACKUP_DIR" -name "careos_*.surql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Cleaned backups older than ${RETENTION_DAYS} days"

# Optional: upload to S3
# aws s3 cp "$FINAL_FILE" "s3://careos-backups/$(basename $FINAL_FILE)"
