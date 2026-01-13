#!/bin/bash

# MarketHub Database Backup Script
# Automated daily PostgreSQL backups


# Configuration
DB_NAME="markethub_db"
DB_USER="markethub_user"
DB_PASSWORD="markethub_dev_password_123"
DB_HOST="localhost"
DB_PORT="5432"

# Backup directory
BACKUP_DIR="/home/kelvin/Development/Phase-4/project/MarketHub/backend/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/markethub_backup_$TIMESTAMP.sql.gz"

# Retention period (days)
RETENTION_DAYS=30

# Log file
LOG_FILE="$BACKUP_DIR/backup.log"

# Functions

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Main Backup Process

log_message "========================================="
log_message "Starting MarketHub database backup"
log_message "========================================="

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    log_message "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Perform backup
log_message "Backing up database: $DB_NAME"
export PGPASSWORD="$DB_PASSWORD"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -b -v -f "$BACKUP_FILE.tmp" "$DB_NAME" 2>> "$LOG_FILE"; then
    # Compress the backup
    gzip "$BACKUP_FILE.tmp"
    mv "$BACKUP_FILE.tmp.gz" "$BACKUP_FILE"

    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

    log_message "Backup completed successfully"
    log_message "Backup file: $BACKUP_FILE"
    log_message "Backup size: $BACKUP_SIZE"
else
    log_message " ERROR: Backup failed!"
    unset PGPASSWORD
    exit 1
fi

# Clean up old backups
log_message "Cleaning up old backups (keeping last $RETENTION_DAYS days)"
find "$BACKUP_DIR" -name "markethub_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE"

BACKUP_COUNT=$(find "$BACKUP_DIR" -name "markethub_backup_*.sql.gz" -type f | wc -l)
log_message "Total backups retained: $BACKUP_COUNT"

# Clean up
unset PGPASSWORD

log_message "========================================="
log_message "Backup process completed"
log_message "========================================="

exit 0
