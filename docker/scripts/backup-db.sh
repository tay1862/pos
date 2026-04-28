#!/bin/bash

# KINSAEP POS - Database Backup Script
# -----------------------------------------------------------------------------

# Load environment variables
source .env

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="kinsaep_pos_db_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "Starting database backup..."

# Run pg_dump inside the container
docker exec kinsaep_pos_db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/$FILENAME

# Compress backup
gzip $BACKUP_DIR/$FILENAME

echo "Backup completed: $BACKUP_DIR/$FILENAME.gz"

# Optional: Delete backups older than 30 days
# find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
