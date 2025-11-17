FROM node:25.2-bookworm-slim AS base

ENV DEBIAN_FRONTEND=noninteractive
RUN \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -eu; \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
    apt-get update && apt-get install -y --no-install-recommends curl ca-certificates dumb-init

RUN --mount=type=cache,target=/root/.npm \
    set -eu; \
    npm install -g npm;

USER node
WORKDIR /usr/src/app

FROM base AS build

COPY ./application/frontend/package*.json /usr/src/app/

RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc \
    --mount=type=cache,target=/root/.npm \
    set -eu; \
    npm ci --include=dev;

COPY --chown=node:node ./application/frontend/ /usr/src/app/
RUN npm run build

RUN set -eu; \
    npm prune --production && \
    npm cache clean --force

FROM nginx:1.29-alpine AS prod

# Install security updates
RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Remove default nginx config and content
RUN rm -rf /usr/share/nginx/html/* && \
    rm /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY ./application/frontend/nginx.prod.conf /etc/nginx/conf.d/default.conf

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

FROM base AS ci

COPY --chown=node:node --from=build /usr/src/app/ /usr/src/app/

CMD [ "tail", "-f", "/dev/null" ]

FROM base AS dev

# Set environment
ENV NODE_ENV=development

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot-reload
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]