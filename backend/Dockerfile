# syntax=docker/dockerfile:1.4

# =============================================================================
# Backend Multi-stage Dockerfile with BuildKit optimization
# Stages: base, development, builder, production, ci
# =============================================================================

# -----------------------------------------------------------------------------
# Stage: base - Common base with dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install security updates and required tools
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        tini && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files for dependency installation
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs prisma ./prisma/

# -----------------------------------------------------------------------------
# Stage: development - For local development with hot-reload
# -----------------------------------------------------------------------------
FROM base AS development

# Set environment
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY --chown=nestjs:nodejs . .

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start development server with hot-reload
CMD ["npm", "run", "start:dev"]

# -----------------------------------------------------------------------------
# Stage: builder - Build the application
# -----------------------------------------------------------------------------
FROM base AS builder

# Set environment
ENV NODE_ENV=production

# Install ALL dependencies (including devDependencies for build)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY --chown=nestjs:nodejs . .

# Build the application
RUN npm run build

# Now prune dev dependencies and clean cache
RUN npm prune --production && \
    npm cache clean --force

# -----------------------------------------------------------------------------
# Stage: production - Optimized production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

# Install security updates and runtime dependencies only
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        dumb-init \
        tini \
        curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set environment
ENV NODE_ENV=production \
    PORT=3001

# Copy production dependencies from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy Prisma files and generated client
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health/live', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/src/main.js"]

# -----------------------------------------------------------------------------
# Stage: ci - For CI/CD pipelines (testing, etc.)
# -----------------------------------------------------------------------------
FROM base AS ci

# Set environment
ENV NODE_ENV=test

# Install all dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY --chown=nestjs:nodejs . .

# Switch to non-root user
USER nestjs

# Default command for CI (can be overridden)
CMD ["npm", "test"]
