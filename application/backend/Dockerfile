FROM node:26-bookworm-slim@sha256:add5c17c14752c54d2f3d519ec46a3815684d41c33f198bcb09fb998f7dcbf68 AS base

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

COPY ./application/backend/package*.json /usr/src/app/

RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc \
    --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    set -eu; \
    npm ci --include=dev;

COPY --chown=node:node ./application/backend/prisma /usr/src/app/prisma
RUN set -eu; \
    npm run db:generate;

COPY --chown=node:node ./application/backend/ /usr/src/app/
RUN npm run build

FROM build AS build-prod

RUN set -eu; \
    npm prune --production && \
    npm cache clean --force

FROM base AS prod

ENV NODE_ENV=production
LABEL org.opencontainers.image.source="https://github.com/cloud-native-aixmarseille/pleey"

COPY --from=build-prod /usr/bin/dumb-init /usr/bin/dumb-init

COPY --chown=node:node --from=build-prod /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build-prod /usr/src/app/prisma /usr/src/app/prisma
COPY --chown=node:node --from=build-prod /usr/src/app/prisma.config.ts /usr/src/app/prisma.config.ts
COPY --chown=node:node --from=build-prod /usr/src/app/dist /usr/src/app/dist
COPY --chown=node:node ./application/backend/scripts/wait-for-database.mjs /usr/src/app/scripts/wait-for-database.mjs

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["curl", "-fsS", "http://localhost:3001/ready"]

CMD ["dumb-init", "node", "--max-old-space-size=200", "/usr/src/app/dist/app/main.js"]

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

COPY --chown=node:node --from=build /usr/src/app/ /usr/src/app/
COPY --chown=node:node ./scripts /usr/src/shared-scripts

CMD [ "tail", "-f", "/dev/null" ]

FROM tools AS dev

# Expose port
EXPOSE 3001

# Start development server with hot-reload after ensuring dependencies
CMD ["sh", "-c", "npm install && npm run db:generate && npm run start:dev"]
