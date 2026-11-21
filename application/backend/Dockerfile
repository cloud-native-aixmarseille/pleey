FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS base

ENV DEBIAN_FRONTEND=noninteractive
# hadolint ignore=DL3008
RUN \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -eu; \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
    apt-get update && apt-get install -y --no-install-recommends curl ca-certificates dumb-init ffmpeg util-linux

USER 1000:1000
WORKDIR /usr/src/app

FROM base AS build

# hadolint ignore=DL3002
USER root
WORKDIR /usr/src/repository
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY application/backend/package.json ./application/backend/package.json
COPY application/frontend/package.json ./application/frontend/package.json
COPY application/contracts/package.json ./application/contracts/package.json
COPY e2e/package.json ./e2e/package.json
COPY .github/actions/determine-pr-checks/package.json ./.github/actions/determine-pr-checks/package.json
COPY application/contracts ./application/contracts
COPY application/backend ./application/backend
COPY application/frontend ./application/frontend
COPY e2e ./e2e

RUN npm install --global pnpm@10.32.1 --ignore-scripts && pnpm install --frozen-lockfile
RUN pnpm --filter @pleey/contracts build
RUN pnpm --filter @pleey/api db:generate && pnpm --filter @pleey/api build

FROM build AS build-prod

FROM base AS prod

ENV NODE_ENV=production
LABEL org.opencontainers.image.source="https://github.com/cloud-native-aixmarseille/pleey"

COPY --from=build-prod /usr/bin/dumb-init /usr/bin/dumb-init

COPY --chown=1000:1000 --from=build-prod /usr/src/repository/node_modules /usr/src/repository/node_modules
COPY --chown=1000:1000 --from=build-prod /usr/src/repository/application/contracts /usr/src/repository/application/contracts
COPY --chown=1000:1000 --from=build-prod /usr/src/repository/application/backend/node_modules /usr/src/repository/application/backend/node_modules
COPY --chown=1000:1000 --from=build-prod /usr/src/repository/application/backend/prisma /usr/src/repository/application/backend/prisma
COPY --chown=1000:1000 --from=build-prod /usr/src/repository/application/backend/prisma.config.ts /usr/src/repository/application/backend/prisma.config.ts
COPY --chown=1000:1000 --from=build-prod /usr/src/repository/application/backend/dist /usr/src/repository/application/backend/dist
COPY --chown=1000:1000 ./application/backend/scripts/wait-for-database.mjs /usr/src/repository/application/backend/scripts/wait-for-database.mjs

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["curl", "-fsS", "http://localhost:3001/ready"]

WORKDIR /usr/src/repository/application/backend
CMD ["dumb-init", "node", "--max-old-space-size=200", "/usr/src/repository/application/backend/dist/app/main.js"]

FROM base AS tools

# Install libs utils for ci
USER 0:0
ENV DEBIAN_FRONTEND=noninteractive
# hadolint ignore=DL3008
RUN \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -eu; \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
    apt-get update && apt-get install -y --no-install-recommends wait-for-it procps
USER 1000:1000

FROM tools AS ci
USER root
RUN npm install --global pnpm@10.32.1 --ignore-scripts
COPY --chown=1000:1000 --from=build /usr/src/repository /usr/src/app
COPY --chown=1000:1000 --from=build /usr/src/repository /usr/src/repository
COPY --chown=1000:1000 ./scripts /usr/src/app/scripts
USER 1000:1000
WORKDIR /usr/src/app

CMD [ "tail", "-f", "/dev/null" ]

FROM tools AS dev

# Expose port
EXPOSE 3001

# Start development server with hot-reload after ensuring dependencies
CMD ["sh", "-c", "npm install --global pnpm@10.32.1 --ignore-scripts && pnpm install --frozen-lockfile && pnpm --filter @pleey/api db:generate && pnpm --filter @pleey/api start:dev"]
