FROM node:26.13.1-bookworm-slim@sha256:add5c17c14752c54d2f3d519ec46a3815684d41c33f198bcb09fb998f7dcbf68 AS base

ENV DEBIAN_FRONTEND=noninteractive
# hadolint ignore=DL3008
RUN \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -eu; \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
    apt-get update && apt-get install -y --no-install-recommends curl ca-certificates dumb-init

USER 1000:1000
WORKDIR /usr/src/app

FROM base AS build

USER root
WORKDIR /usr/src/repository
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY application/backend/package.json ./application/backend/package.json
COPY application/frontend/package.json ./application/frontend/package.json
COPY application/contracts/package.json ./application/contracts/package.json
COPY e2e/package.json ./e2e/package.json
COPY .github/actions/determine-pr-checks/package.json ./.github/actions/determine-pr-checks/package.json
COPY application/contracts ./application/contracts
COPY application/frontend ./application/frontend

RUN npm install --global pnpm@10.32.1 --ignore-scripts && pnpm install --frozen-lockfile
RUN pnpm --filter @pleey/contracts build
RUN pnpm --filter @pleey/web build

FROM nginx:1.31-alpine@sha256:713fc2ebfd92e8217db451477182ee91944b123d2b1ee9fd5a8c6e91ca6c3a11 AS prod

LABEL org.opencontainers.image.source="https://github.com/cloud-native-aixmarseille/pleey"

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
COPY --from=build /usr/src/repository/application/frontend/dist /usr/share/nginx/html

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
    CMD ["curl", "-f", "http://localhost:8080/"]

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

FROM base AS ci
COPY --chown=node:node --from=build /usr/src/repository /usr/src/repository
COPY --chown=node:node ./scripts /usr/src/repository/scripts
COPY --chown=node:node ./docs /usr/src/repository/docs
COPY --chown=node:node ./README.md ./AGENTS.md ./CONTRIBUTING.md /usr/src/repository/
WORKDIR /usr/src/repository

CMD [ "tail", "-f", "/dev/null" ]

FROM base AS dev

# Set environment
ENV NODE_ENV=development

# Expose Vite dev server port
EXPOSE 5173

# Start development server with hot-reload
CMD ["sh", "-c", "npm install --global pnpm@10.32.1 --ignore-scripts && pnpm install --frozen-lockfile && pnpm --filter @pleey/web dev -- --host 0.0.0.0 --port 5173"]
