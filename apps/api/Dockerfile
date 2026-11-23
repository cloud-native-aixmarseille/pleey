FROM node:26.13.1-bookworm-slim@sha256:add5c17c14752c54d2f3d519ec46a3815684d41c33f198bcb09fb998f7dcbf68 AS base

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

USER root
WORKDIR /usr/src/repository
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY e2e/package.json ./e2e/package.json
COPY .github/actions/determine-pr-checks/package.json ./.github/actions/determine-pr-checks/package.json
COPY packages/contracts ./packages/contracts
COPY apps/api ./apps/api

RUN npm install --global pnpm@10.32.1 --ignore-scripts && pnpm install --frozen-lockfile
RUN pnpm --filter @pleey/contracts build
RUN cd apps/api && pnpm db:generate && pnpm build

FROM build AS build-prod

FROM base AS prod

ENV NODE_ENV=production
LABEL org.opencontainers.image.source="https://github.com/cloud-native-aixmarseille/pleey"

COPY --from=build-prod /usr/bin/dumb-init /usr/bin/dumb-init

COPY --chown=node:node --from=build-prod /usr/src/repository/node_modules /usr/src/repository/node_modules
COPY --chown=node:node --from=build-prod /usr/src/repository/packages/contracts /usr/src/repository/packages/contracts
COPY --chown=node:node --from=build-prod /usr/src/repository/apps/api/node_modules /usr/src/repository/apps/api/node_modules
COPY --chown=node:node --from=build-prod /usr/src/repository/apps/api/prisma /usr/src/repository/apps/api/prisma
COPY --chown=node:node --from=build-prod /usr/src/repository/apps/api/prisma.config.ts /usr/src/repository/apps/api/prisma.config.ts
COPY --chown=node:node --from=build-prod /usr/src/repository/apps/api/dist /usr/src/repository/apps/api/dist
COPY --chown=node:node ./apps/api/scripts/wait-for-database.mjs /usr/src/repository/apps/api/scripts/wait-for-database.mjs

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["curl", "-fsS", "http://localhost:3001/ready"]

WORKDIR /usr/src/repository/apps/api
CMD ["dumb-init", "node", "--max-old-space-size=200", "/usr/src/repository/apps/api/dist/app/main.js"]

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
COPY --chown=node:node --from=build /usr/src/repository /usr/src/repository
COPY --chown=node:node ./scripts /usr/src/repository/scripts
WORKDIR /usr/src/repository

CMD [ "tail", "-f", "/dev/null" ]

FROM tools AS dev

# Expose port
EXPOSE 3001

# Start development server with hot-reload after ensuring dependencies
CMD ["sh", "-c", "npm install --global pnpm@10.32.1 --ignore-scripts && pnpm install --frozen-lockfile && pnpm --filter @pleey/api db:generate && pnpm --filter @pleey/api start:dev"]
