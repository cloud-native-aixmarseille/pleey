# Production delivery runbook

Phase 01 preserves the existing custom identity, GraphQL and Socket.IO product contracts. Deploy API and web as a single tested manifest.

## Configuration

Before traffic switches, provide all required values from `compose.production.yaml`: HTTPS domain, API/web OCI digests, release ID, database URL, Valkey URL, SMTP endpoint and credentials, JWT secrets, media storage configuration and a SeaweedFS S3 configuration file.

Use a one-time operator bootstrap only through the existing account registration and authorization domain. Never use the development seed accounts in production.

## Migration

Run `prisma migrate deploy` once as an explicit migration job. Do not run migrations independently on every application pod. An interrupted or failed migration fails the rollout and is never marked applied by the harness.

## Rollout

1. Render the selected Compose or Helm profile.
2. Verify the manifest source SHA, API/web digests, chart checksum and protocol majors.
3. Back up PostgreSQL and referenced media.
4. Run the migration job and readiness smoke.
5. Switch HTTPS proxy traffic to the candidate API/web images.
6. Verify registration/recovery, authorized management, guest play, private media and health/release reads.

## Rollback

Because Phase 01 makes no business-schema or authentication contract change, restore the previous API/web chart and image manifest against the unchanged schema if failure occurs before writes reopen. If candidate writes reopened, do not replace the database; preserve candidate writes and roll forward. Media and database backup state must be restored together only when rollback occurs before writes reopen.
