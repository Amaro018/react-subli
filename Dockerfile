# -----------------------------------------------------------------------------
# Base Image
# -----------------------------------------------------------------------------
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Install OpenSSL and certificates required by Prisma engine
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Dependencies
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy dependency manifests and .npmrc configuration
COPY package.json package-lock.json .npmrc ./

# Disable husky git hook setup in container
ENV HUSKY=0

# Install dependencies (respecting package-lock.json and legacy-peer-deps in .npmrc)
RUN npm ci

# -----------------------------------------------------------------------------
# Builder
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma Client
RUN npx prisma generate --schema=db/schema.prisma

# Build the Blitz / Next.js application
RUN npm run build

# -----------------------------------------------------------------------------
# Production Runner
# -----------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:./subli-react.sqlite"

# Copy package and TypeScript config
COPY package.json package-lock.json .npmrc ./
COPY next.config.js ./
COPY tsconfig.json ./
COPY types.ts ./

# Copy compiled artifacts, node_modules, and source files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/db ./db
COPY --from=builder /app/src ./src

# Ensure storage directories exist
RUN mkdir -p /app/db /app/public/uploads

# Setup entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
