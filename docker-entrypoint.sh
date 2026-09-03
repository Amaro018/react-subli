#!/bin/sh
set -e

# Default SQLite database path if DATABASE_URL is not set
export DATABASE_URL="${DATABASE_URL:-file:./subli-react.sqlite}"

# Provide a fallback SESSION_SECRET_KEY for Blitz in production if not explicitly configured
export SESSION_SECRET_KEY="${SESSION_SECRET_KEY:-subli_default_session_secret_key_min_32_characters_long}"

# Ensure required directories exist
mkdir -p /app/db /app/public/uploads

# Run database migrations if Prisma schema exists
if [ -f "/app/db/schema.prisma" ]; then
  echo "==> Running Prisma migration deploy..."
  npx prisma migrate deploy --schema=/app/db/schema.prisma || {
    echo "==> Migration deploy had issues, falling back to prisma db push..."
    npx prisma db push --schema=/app/db/schema.prisma || true
  }
fi

# Run seed script if AUTO_SEED or SEED_DATABASE is enabled
if [ "$AUTO_SEED" = "true" ] || [ "$SEED_DATABASE" = "true" ]; then
  echo "==> Running database seed..."
  npx blitz db seed || true
fi

echo "==> Starting application: $@"
exec "$@"
