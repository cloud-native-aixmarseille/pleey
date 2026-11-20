# Backup and restore runbook

Back up PostgreSQL and referenced media from the same operational cutover point. Restore database and media only into run-owned resources; never restore over a shared database.

## Procedure

1. Stop or drain writes according to the production release window.
2. Record migration history and PostgreSQL major.
3. Create a PostgreSQL backup and media inventory/checksum.
4. Create fresh isolated PostgreSQL and object-storage resources.
5. Restore the database first, then the referenced media objects.
6. Apply no migration manually; use `prisma migrate deploy` to validate the restored migration history.
7. Start the matching API/web release and verify relationships, ownership and private media.
8. Open writes only after readiness and smoke checks pass.

`pnpm test:restore --profile isolated` is the synthetic rehearsal entrypoint. Restore artifacts must record source/destination counts, ownership mappings and a sanitized checksum report.
