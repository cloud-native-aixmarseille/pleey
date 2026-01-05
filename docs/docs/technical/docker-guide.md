---
sidebar_position: 3
---

# 🐳 Docker Guide - QuizMaster

Concise reference for running QuizMaster with Docker Compose. The `Makefile` orchestrates all common workflows; use it as the primary interface rather than memorising raw Docker commands.

:::tip Primary Interface
Run `make help` to list every target with a short description.
:::

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- GNU Make (usually preinstalled on Linux and macOS)

Verify tooling once:

```bash
docker --version
docker compose version
make --version
```

## First Run

```bash
cp .env.example .env
make install
```

`make install` performs the full bootstrap: builds images, ensures the shared `traefik-proxy` network exists, starts services, applies Prisma migrations, and seeds demo data. When it finishes, access the stack at:

- Frontend → `http://quiz-app.localhost`
- Backend API → `http://quiz-app.localhost/api`
- Traefik dashboard → `http://traefik.localhost` (created by `make setup-traefik`)

## Daily Workflow

| Task                          | Command                            |
| ----------------------------- | ---------------------------------- |
| Start core services           | `make up`                          |
| Follow logs                   | `make logs` or `make logs-SERVICE` |
| Reseed database               | `make seed`                        |
| Stop services                 | `make down`                        |
| Full reset (⚠️ wipes volumes) | `make clean-all`                   |

See the [Quick Reference](./quick-reference) for the wider command catalogue (tests, monitoring, docs).

## Networking & Reverse Proxy

- `make setup-traefik` provisions a long-lived `traefik-local` container and the shared `traefik-proxy` network. The target runs automatically before `make up`.
- If you already run another reverse proxy on ports 80/443, stop `traefik-local` (`docker stop traefik-local`) and attach your proxy to the `traefik-proxy` network instead.
- QuizMaster services join the same network and expose hostnames under `*.quiz-app.localhost` (resolved automatically by RFC 6761).
- The Traefik dashboard is available at <http://traefik.localhost>.
- The hostname stays generic so the same proxy can route multiple local projects.

Routing labels live in `compose.yaml`, and the frontend default API URL is defined in `application/frontend/src/shared/api/openapiClient.ts`.

## Data & Maintenance

- PostgreSQL data lives in the `postgres-data` volume.
- `make backup` and `make restore` wrap `pg_dump`/`psql` for quick exports.
- `make db-shell` opens an interactive `psql` session without exposing ports.
- Production overrides and resource limits are defined in `compose.prod.yaml`; review the [Deployment](./deployment) guide before releasing.

## Troubleshooting cheat sheet

- `make ps` → inspect container state and health.
- `make health` → confirm backend liveness and frontend availability.
- `docker network inspect traefik-proxy` → ensure the shared proxy sees frontend/backend containers.
- `docker logs traefik-local` → investigate routing issues when `*.quiz-app.localhost` fails.
- `make clean && make up` → rebuild the stack without dropping volumes.

If issues persist, revisit the [Quick Start](../functional/quickstart) and the [Testing guide](./testing).

## Further Reading

- [Quick Reference](./quick-reference)
- [Architecture](./architecture/index)
- [Security](./security)
- [`compose.yaml`](../../../compose.yaml)
