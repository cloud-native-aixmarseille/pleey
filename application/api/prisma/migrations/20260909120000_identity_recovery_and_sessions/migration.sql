BEGIN;

CREATE TABLE "user_authentications" (
  "user_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "password_reset_token_hash" TEXT,
  "password_reset_expires_at" TIMESTAMP(3),
  "reset_request_locale" TEXT,
  "reset_requested_at" TIMESTAMP(3),
  "reset_available_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_authentications_pkey" PRIMARY KEY ("user_id"),
  CONSTRAINT "user_authentications_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "user_sessions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "refresh_token_hash" TEXT NOT NULL,
  "refresh_token_expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "last_active_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "user_agent" VARCHAR(512),
  "ip_address" VARCHAR(64),
  CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "user_authentications"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Previous JWTs have no session identifier; require sign-in after deployment.
INSERT INTO "user_authentications" (
  "user_id", "email", "password", "password_reset_token_hash", "password_reset_expires_at",
  "reset_request_locale", "reset_requested_at", "reset_available_at", "created_at", "updated_at"
)
SELECT
  u."id",
  u."email",
  u."password",
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  u."created_at",
  u."updated_at"
FROM "users" u;

CREATE UNIQUE INDEX "user_authentications_email_key" ON "user_authentications"("email");
CREATE UNIQUE INDEX "user_authentications_password_reset_token_hash_key"
  ON "user_authentications"("password_reset_token_hash");
CREATE INDEX "user_authentications_reset_available_at_idx" ON "user_authentications"("reset_available_at");
CREATE UNIQUE INDEX "user_sessions_refresh_token_hash_key" ON "user_sessions"("refresh_token_hash");
CREATE INDEX "user_sessions_user_id_created_at_id_idx" ON "user_sessions"("user_id", "created_at", "id");

ALTER TABLE "users"
  DROP COLUMN "email",
  DROP COLUMN "password",
  DROP COLUMN "refresh_token_hash",
  DROP COLUMN "refresh_token_expires_at";

COMMIT;
