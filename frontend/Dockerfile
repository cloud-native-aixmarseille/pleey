# syntax=docker/dockerfile:1.4

# =============================================================================
# Frontend Multi-stage Dockerfile with BuildKit optimization
# Stages: base, development, builder, production, ci
# =============================================================================

# -----------------------------------------------------------------------------
# Stage: base - Common base with dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001

# Copy package files for dependency installation
COPY --chown=reactuser:nodejs package*.json ./

# -----------------------------------------------------------------------------
# Stage: development - For local development with hot-reload
# -----------------------------------------------------------------------------
FROM base AS development

# Set environment
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY --chown=reactuser:nodejs . .

# Switch to non-root user
USER reactuser

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot-reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# -----------------------------------------------------------------------------
# Stage: builder - Build the application
# -----------------------------------------------------------------------------
FROM base AS builder

# Set environment
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY --chown=reactuser:nodejs . .

# Build the application
RUN npm run build && \
    npm cache clean --force

# -----------------------------------------------------------------------------
# Stage: production - Optimized Nginx production image
# -----------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Remove default nginx config and content
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Create non-root user for Nginx
RUN addgroup -g 101 -S nginx || true && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# -----------------------------------------------------------------------------
# Stage: ci - For CI/CD pipelines (testing, linting, etc.)
# -----------------------------------------------------------------------------
FROM base AS ci

# Set environment
ENV NODE_ENV=test

# Install all dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY --chown=reactuser:nodejs . .

# Switch to non-root user
USER reactuser

# Default command for CI (can be overridden)
CMD ["npm", "test"]