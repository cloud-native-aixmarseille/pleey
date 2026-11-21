# Phase 01 deletion inventory

## Deleted executable paths

- `application/backend/`
- `application/frontend/`
- `application/shared/`
- Package-local `package-lock.json` files in API, web and shared packages
- `e2e/package-lock.json`
- `.github/actions/determine-pr-checks/package-lock.json`

The old application directories contain no source copy after the move. Historical baseline commits and ADR quotations remain in Git history and retained architectural records.

## Replaced or removed dependencies

Phase 01 removes no current application dependency or active runtime. It adds no active Better Auth, REST/OpenAPI, Colyseus or PWA implementation.

Package scripts and Docker/CI references no longer use package-local npm locks or old source paths.

## Data migration inventory

No data model change is introduced in Phase 01. The existing schema migration chain is retained in `application/backend/prisma/migrations/` and must be applied with `prisma migrate deploy`.

No legacy table conversion or destructive cleanup is authorized. PostgreSQL and media rollback/recovery preserve existing business ownership and historical results.
