-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "legacy_user_id" INTEGER,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "avatar_media_id" INTEGER;

-- Migrate existing inline avatar SVG payloads into media rows.
INSERT INTO "media" (
    "kind",
    "mime_type",
    "content",
    "created_at",
    "updated_at",
    "deleted_at",
    "legacy_user_id"
)
SELECT
    'avatar',
    'image/svg+xml',
    convert_to("avatar_uri", 'UTF8'),
    COALESCE("created_at", CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP,
    NULL,
    "id"
FROM "users"
WHERE "avatar_uri" IS NOT NULL;

UPDATE "users" AS "user"
SET "avatar_media_id" = "media"."id"
FROM "media"
WHERE "media"."legacy_user_id" = "user"."id";

ALTER TABLE "media" DROP COLUMN "legacy_user_id";
ALTER TABLE "users" DROP COLUMN "avatar_uri";

-- CreateIndex
CREATE UNIQUE INDEX "users_avatar_media_id_key" ON "users"("avatar_media_id");

-- AddForeignKey
ALTER TABLE "users"
ADD CONSTRAINT "users_avatar_media_id_fkey"
FOREIGN KEY ("avatar_media_id") REFERENCES "media"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;