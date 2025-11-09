FROM node:25.1-bookworm-slim AS base

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

COPY ./backend/package*.json /usr/src/app/

RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc \
    --mount=type=cache,target=/root/.npm \
    set -eu; \
    npm ci --include=dev;

COPY --chown=node:node ./backend/prisma /usr/src/app/
RUN set -eu; \
    npm run prisma:generate;

COPY --chown=node:node ./backend/ /usr/src/app/
RUN npm run build

RUN set -eu; \
    npm prune --production && \
    npm cache clean --force

FROM base AS prod

ENV NODE_ENV production

COPY --from=build-app /usr/bin/dumb-init /usr/bin/dumb-init

COPY --chown=node:node --from=build-app /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build-app /usr/src/app/prisma /usr/src/app/prisma
COPY --chown=node:node --from=build-app /usr/src/app/dist /usr/src/app/dist

CMD dumb-init node --max-old-space-size=200 "/usr/src/app/dist/main.js"

FROM base as tools

# Install libs utils for ci
USER root
ENV DEBIAN_FRONTEND=noninteractive
RUN \
    --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    set -eu; \
    rm -f /etc/apt/apt.conf.d/docker-clean && \
    echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' >/etc/apt/apt.conf.d/keep-cache && \
    apt-get update && apt-get install -y --no-install-recommends wait-for-it procps
USER node

FROM tools AS ci

COPY --chown=node:node --from=build /usr/src/app/ /usr/src/app/

CMD [ "tail", "-f", "/dev/null" ]

FROM tools AS dev

# Expose port
EXPOSE 3001

# Start development server with hot-reload after ensuring dependencies
CMD ["sh", "-c", "npm install && npm run start:dev"]