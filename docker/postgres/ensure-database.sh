#!/bin/sh
set -e

: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"

until pg_isready -h db -U "$POSTGRES_USER" -d postgres >/dev/null 2>&1; do
  echo "Waiting for Postgres..."
  sleep 1
done

exists=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h db -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'")

if [ "$exists" != "1" ]; then
  echo "Creating database \"$POSTGRES_DB\"..."
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h db -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$POSTGRES_DB\""
else
  echo "Database \"$POSTGRES_DB\" already exists"
fi
