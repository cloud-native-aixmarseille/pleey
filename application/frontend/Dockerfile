FROM node:26-bookworm-slim AS base

ENV DEBIAN_FRONTEND=noninteractive
# hadolint ignore=DL3008
RUN \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -eu; \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
    apt-get update && apt-get install -y --no-install-recommends curl ca-certificates dumb-init

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

FROM nginx:1.31.2-alpine AS prod

# Install security updates
# hadolint ignore=DL3018
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

# Create non-root user for Nginx (high UID to satisfy security scanners)
RUN set -eu; \
    addgroup -g 10001 -S app 2>/dev/null || true; \
    adduser -S -D -H -u 10001 -h /var/cache/nginx -s /sbin/nologin -G app app 2>/dev/null || true

# Set proper permissions
RUN chown -R 10001:10001 /usr/share/nginx/html && \
    chown -R 10001:10001 /var/cache/nginx && \
    chown -R 10001:10001 /var/log/nginx && \
    chown -R 10001:10001 /etc/nginx/conf.d && \
    mkdir -p /var/run && \
    touch /var/run/nginx.pid && \
    chown -R 10001:10001 /var/run/nginx.pid

# Switch to non-root user
USER 10001

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

FROM base AS ci

COPY --chown=node:node --from=build /usr/src/app/ /usr/src/app/
COPY --chown=node:node ./application/backend/src/schema.gql /usr/src/backend/src/schema.gql
COPY --chown=node:node ./scripts /usr/src/shared-scripts

CMD [ "tail", "-f", "/dev/null" ]

FROM base AS dev

# Set environment
ENV NODE_ENV=development

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot-reload
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]