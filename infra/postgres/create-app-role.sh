#!/bin/sh
# Runs once when the postgres volume is initialized.
# POSTGRES_USER owns every module schema and applies migrations. The application role only reads
# and writes data in schemas and tables that POSTGRES_USER creates later.
set -eu

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set app_user="$POSTGRES_APP_USER" \
  --set app_password="$POSTGRES_APP_PASSWORD" \
  --set owner="$POSTGRES_USER" \
  --set db="$POSTGRES_DB" <<'SQL'
CREATE ROLE :"app_user" LOGIN PASSWORD :'app_password';
GRANT CONNECT ON DATABASE :"db" TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"owner" GRANT USAGE ON SCHEMAS TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"owner" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"owner" GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
SQL
