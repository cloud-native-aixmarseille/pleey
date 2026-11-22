ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "image" TEXT,
  ADD COLUMN IF NOT EXISTS "is_anonymous" BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE "users" AS u
SET
  "name" = u."username",
  "email" = COALESCE(a."email", u."email"),
  "email_verified" = FALSE
FROM "user_authentications" AS a
WHERE a."user_id" = u."id";

UPDATE "users"
SET "email" = 'migrated-' || "id"::text || '@invalid.local'
WHERE "email" = '';

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "auth_sessions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_sessions_token_key" ON "auth_sessions"("token");
CREATE INDEX IF NOT EXISTS "auth_sessions_user_id_expires_at_idx" ON "auth_sessions"("user_id", "expires_at");

CREATE TABLE IF NOT EXISTS "auth_accounts" (
  "id" UUID NOT NULL,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" TIMESTAMP(3),
  "refresh_token_expires_at" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_accounts_provider_id_account_id_key"
  ON "auth_accounts"("provider_id", "account_id");
CREATE INDEX IF NOT EXISTS "auth_accounts_user_id_idx" ON "auth_accounts"("user_id");

INSERT INTO "auth_accounts"
  ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
SELECT
  gen_random_uuid(), a."user_id"::text, 'credential', a."user_id", NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "user_authentications" AS a
WHERE NOT EXISTS (
  SELECT 1 FROM "auth_accounts" AS ba
  WHERE ba."provider_id" = 'credential' AND ba."account_id" = a."user_id"::text
)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS "auth_verifications" (
  "id" UUID NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "auth_verifications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_verifications_identifier_value_key"
  ON "auth_verifications"("identifier", "value");

CREATE TABLE IF NOT EXISTS "party_participants" (
  "id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "roles" TEXT[] NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "display_name" TEXT NOT NULL,
  "controller_generation" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "party_participants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "party_participants_party_id_user_id_key"
  ON "party_participants"("party_id", "user_id");
CREATE INDEX IF NOT EXISTS "party_participants_party_id_status_idx"
  ON "party_participants"("party_id", "status");
CREATE INDEX IF NOT EXISTS "party_participants_user_id_status_idx"
  ON "party_participants"("user_id", "status");

CREATE TABLE IF NOT EXISTS "user_participation_claims" (
  "user_id" UUID NOT NULL,
  "party_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_participation_claims_pkey" PRIMARY KEY ("user_id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_participation_claims_party_id_user_id_key"
  ON "user_participation_claims"("party_id", "user_id");

CREATE TABLE IF NOT EXISTS "identity_transfers" (
  "id" UUID NOT NULL,
  "operation_id" TEXT NOT NULL,
  "source_user_id" UUID NOT NULL,
  "target_user_id" UUID,
  "source_session_id" UUID NOT NULL,
  "status" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "prepared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verified_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "party_id" UUID,
  "step_markers" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "failure_reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "identity_transfers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "identity_transfers_operation_id_key"
  ON "identity_transfers"("operation_id");
CREATE INDEX IF NOT EXISTS "identity_transfers_source_user_id_status_idx"
  ON "identity_transfers"("source_user_id", "status");
CREATE INDEX IF NOT EXISTS "identity_transfers_target_user_id_status_idx"
  ON "identity_transfers"("target_user_id", "status");

ALTER TABLE "scores" ADD COLUMN IF NOT EXISTS "participant_id" UUID;

INSERT INTO "party_participants"
  ("id", "party_id", "user_id", "roles", "status", "display_name", "controller_generation", "updated_at")
SELECT DISTINCT
  gen_random_uuid(), p."id", u."id", ARRAY['HOST']::TEXT[], 'ACTIVE', u."username", 0, CURRENT_TIMESTAMP
FROM "parties" p
JOIN "users" u ON u."id" = p."host_id"
WHERE NOT EXISTS (
  SELECT 1 FROM "party_participants" pp
  WHERE pp."party_id" = p."id" AND pp."user_id" = u."id"
)
ON CONFLICT DO NOTHING;

INSERT INTO "party_participants"
  ("id", "party_id", "user_id", "roles", "status", "display_name", "controller_generation", "updated_at")
SELECT DISTINCT
  gen_random_uuid(), s."party_id", s."user_id", ARRAY['PLAYER']::TEXT[], 'ACTIVE', u."username", 0, CURRENT_TIMESTAMP
FROM "scores" s
JOIN "users" u ON u."id" = s."user_id"
WHERE s."user_id" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "party_participants" pp
    WHERE pp."party_id" = s."party_id" AND pp."user_id" = s."user_id"
  )
ON CONFLICT DO NOTHING;

UPDATE "party_participants" pp
SET "roles" = ARRAY(
  SELECT DISTINCT role FROM unnest(pp."roles" || ARRAY['PLAYER']::TEXT[]) AS role
)
FROM "scores" s
WHERE s."participant_id" IS NULL
  AND s."party_id" = pp."party_id"
  AND s."user_id" = pp."user_id";

UPDATE "scores" s
SET "participant_id" = pp."id"
FROM "party_participants" pp
WHERE pp."party_id" = s."party_id"
  AND pp."user_id" = s."user_id";

INSERT INTO "user_participation_claims" ("user_id", "party_id")
SELECT pp."user_id", pp."party_id"
FROM "party_participants" pp
WHERE 'PLAYER' = ANY(pp."roles") AND pp."status" = 'ACTIVE'
ON CONFLICT ("user_id") DO NOTHING;

ALTER TABLE "auth_sessions"
  ADD CONSTRAINT "auth_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_accounts"
  ADD CONSTRAINT "auth_accounts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "party_participants"
  ADD CONSTRAINT "party_participants_party_id_fkey"
  FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "party_participants_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TABLE "user_sessions";
DROP TABLE "user_authentications";
