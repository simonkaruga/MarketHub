#!/bin/bash

# MarketHub Database Restore Script
# Restore from backup file

# Configuration
DB_NAME="markethub_db"
DB_USER="markethub_user"
DB_PASSWORD="markethub_dev_password_123"
DB_HOST="localhost"
DB_PORT="5432"

# Backup directory
BACKUP_DIR="/home/kelvin/Development/Phase-4/project/MarketHub/backend/backups"

# Log file
LOG_FILE="$BACKUP_DIR/restore.log"

# Functions

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

show_usage() {
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Example:"
    echo "  $0 /path/to/markethub_backup_20260113_020000.sql.gz"
    echo ""
    echo "Available backups:"
    find "$BACKUP_DIR" -name "markethub_backup_*.sql.gz" -type f -exec ls -lh {} \; | tail -10
}

# Main Restore Process

# Check if backup file was provided
if [ -z "$1" ]; then
    echo " ERROR: No backup file specified"
    echo ""
    show_usage
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_message " ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

log_message "========================================="
log_message "Starting MarketHub database restore"
log_message "========================================="
log_message "Backup file: $BACKUP_FILE"

# Confirm restore
echo ""
echo "  WARNING: This will REPLACE all data in database '$DB_NAME'"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_message "Restore cancelled by user"
    exit 0
fi

# Set password
export PGPASSWORD="$DB_PASSWORD"

# Drop existing connections
log_message "Terminating existing database connections..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    2>> "$LOG_FILE"

# Drop and recreate database
log_message "Dropping database: $DB_NAME"
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>> "$LOG_FILE"

log_message "Creating database: $DB_NAME"
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>> "$LOG_FILE"

# Restore backup
log_message "Restoring backup..."
if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    log_message " Database restored successfully"
else
    log_message " ERROR: Restore failed! Check $LOG_FILE for details"
    unset PGPASSWORD
    exit 1
fi

# Clean up
unset PGPASSWORD

log_message "========================================="
log_message "Restore process completed"
log_message "========================================="

exit 0
